/* daily-challenge.js - Daily challenge mode: "Today's 10 Questions" */

const DailyChallenge = {

    QUESTION_COUNT: 10,

    _key(playerId) {
        return `mentalMaths_daily_${playerId}`;
    },

    // Seeded random for consistent daily questions
    _seededRandom(seed) {
        let s = seed;
        return function () {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            return s / 0x7fffffff;
        };
    },

    _todayStr() {
        return new Date().toISOString().split('T')[0];
    },

    // Get today's challenge status
    getStatus(playerId) {
        try {
            const raw = localStorage.getItem(this._key(playerId));
            const data = raw ? JSON.parse(raw) : null;
            if (data && data.date === this._todayStr()) return data;
            return null;
        } catch {
            return null;
        }
    },

    isCompletedToday(playerId) {
        const status = this.getStatus(playerId);
        return status && status.completed;
    },

    // Save today's challenge result
    saveResult(playerId, result) {
        const data = {
            date: this._todayStr(),
            completed: true,
            ...result,
        };
        localStorage.setItem(this._key(playerId), JSON.stringify(data));
    },

    // Generate today's challenge plan (deterministic based on date + player)
    generatePlan(playerId) {
        const dateStr = this._todayStr();
        const seed = this._hashCode(dateStr + playerId);
        const rng = this._seededRandom(seed);

        const unlocked = STRATEGIES.filter(s => {
            if (!s.unlockRequires) return true;
            const allProg = Storage.getAllStrategyProgress(playerId);
            const req = allProg[s.unlockRequires];
            return req && req.mastery >= 50;
        });

        if (!unlocked.length) return [];

        const plan = [];
        for (let i = 0; i < this.QUESTION_COUNT; i++) {
            const idx = Math.floor(rng() * unlocked.length);
            plan.push({ strategyId: unlocked[idx].id });
        }
        return plan;
    },

    _hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    },

    // Render daily challenge card for home screen
    renderCard(playerId) {
        const completed = this.isCompletedToday(playerId);
        const status = this.getStatus(playerId);

        if (completed && status) {
            return `
            <div class="daily-challenge-card completed">
                <div class="daily-icon">&#x2705;</div>
                <div class="daily-info">
                    <div class="daily-title">Today's Challenge Complete!</div>
                    <div class="daily-result">${status.correct}/${status.total} correct · ${status.avgTime}s avg</div>
                </div>
            </div>`;
        }

        return `
        <div class="daily-challenge-card" id="btn-daily-challenge">
            <div class="daily-icon">&#x1f31f;</div>
            <div class="daily-info">
                <div class="daily-title">Daily Challenge</div>
                <div class="daily-subtitle">Today's 10 Questions</div>
            </div>
            <div class="daily-arrow">&rarr;</div>
        </div>`;
    },

    // Get streak of consecutive days completed
    getStreak(playerId) {
        const historyKey = `mentalMaths_dailyHistory_${playerId}`;
        try {
            const raw = localStorage.getItem(historyKey);
            const history = raw ? JSON.parse(raw) : [];
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const ds = d.toISOString().split('T')[0];
                if (history.includes(ds)) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
            }
            return streak;
        } catch {
            return 0;
        }
    },

    recordCompletion(playerId) {
        const historyKey = `mentalMaths_dailyHistory_${playerId}`;
        try {
            const raw = localStorage.getItem(historyKey);
            const history = raw ? JSON.parse(raw) : [];
            const today = this._todayStr();
            if (!history.includes(today)) {
                history.push(today);
                localStorage.setItem(historyKey, JSON.stringify(history));
            }
        } catch { /* ignore */ }
    },
};

/* spaced-repetition.js - SM-2 spaced repetition algorithm */

const SpacedRepetition = {

    DEFAULT_EASE: 2.5,
    MIN_EASE: 1.3,

    // Quality mapping: correct + speed -> 0-5 quality score
    getQuality(correct, timeMs) {
        if (!correct) return 1;
        if (timeMs <= 3000) return 5;   // fast
        if (timeMs <= 8000) return 4;   // ok
        if (timeMs <= 15000) return 3;  // slow
        return 2;                        // very slow but correct
    },

    // Get SM-2 data for a strategy, initialise if missing
    getData(playerId, strategyId) {
        const key = `sm2_${playerId}_${strategyId}`;
        const data = Storage._read(key);
        return data || {
            easeFactor: this.DEFAULT_EASE,
            interval: 0,       // days
            repetitions: 0,
            nextReview: null,   // ISO date string
            lastReview: null,
        };
    },

    saveData(playerId, strategyId, data) {
        const key = `sm2_${playerId}_${strategyId}`;
        Storage._write(key, data);
    },

    // Update SM-2 data after a practice session result
    update(playerId, strategyId, quality) {
        const d = this.getData(playerId, strategyId);

        if (quality >= 3) {
            // Correct response
            if (d.repetitions === 0) {
                d.interval = 1;
            } else if (d.repetitions === 1) {
                d.interval = 6;
            } else {
                d.interval = Math.round(d.interval * d.easeFactor);
            }
            d.repetitions++;
        } else {
            // Incorrect - reset
            d.repetitions = 0;
            d.interval = 1;
        }

        // Update ease factor
        d.easeFactor = d.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        d.easeFactor = Math.max(this.MIN_EASE, d.easeFactor);

        d.lastReview = new Date().toISOString();
        const next = new Date();
        next.setDate(next.getDate() + d.interval);
        d.nextReview = next.toISOString();

        this.saveData(playerId, strategyId, d);
        return d;
    },

    // Get strategy urgency score (higher = more overdue)
    getUrgency(playerId, strategyId) {
        const d = this.getData(playerId, strategyId);
        if (!d.nextReview) return 100; // Never reviewed = highest urgency

        const now = Date.now();
        const due = new Date(d.nextReview).getTime();
        const daysPast = (now - due) / 86400000;

        if (daysPast > 0) return 50 + Math.min(daysPast * 10, 50); // Overdue
        return Math.max(0, 20 - Math.abs(daysPast) * 5); // Not yet due
    },

    // Select best strategy to review using SM-2
    selectStrategy(playerId, unlockedStrategies) {
        const scored = unlockedStrategies.map(s => ({
            strategy: s,
            urgency: this.getUrgency(playerId, s.id),
        }));
        scored.sort((a, b) => b.urgency - a.urgency);
        // Pick from top 3 with some randomness
        const top = scored.slice(0, Math.min(3, scored.length));
        return pick(top).strategy;
    },

    // Check if SM-2 is enabled in settings
    isEnabled() {
        return Settings.get('spacedRepetition', true);
    },
};

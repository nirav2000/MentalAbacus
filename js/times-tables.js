/* times-tables.js - Multiplication & division fact tables (1-20 + custom) */

const TimesTables = {
    SESSION_LENGTH: 10,

    init() {
        for (let n = 1; n <= 20; n++) this._registerGenerator(n);
        this.getCustomTables().forEach(n => this._registerGenerator(n));
    },

    _registerGenerator(n) {
        Generators[this.getTableId(n)] = (level) => this.generateQuestion(n, level);
    },

    getTableId(n) { return `times_${n}`; },

    getTableNumber(id) { return parseInt(id.replace('times_', ''), 10); },

    isTimesTable(id) { return id != null && id.startsWith('times_'); },

    getTableName(id) { return `${this.getTableNumber(id)}× Table`; },

    getAllTableNumbers() {
        const standard = [];
        for (let i = 1; i <= 20; i++) standard.push(i);
        const custom = this.getCustomTables().filter(n => n > 20);
        return [...standard, ...custom];
    },

    // ----- Question Generation -----

    generateQuestion(n, level) {
        // Level ranges for the multiplier b
        const ranges = { 1: [1, 5], 2: [1, 10], 3: [1, 12], 4: [1, 15], 5: [1, 20] };
        const [min, max] = ranges[level] || ranges[1];
        const b = randInt(min, max);
        const product = n * b;

        // Division introduced at level 3+
        if (level >= 3 && Math.random() < 0.4) {
            return {
                questionText: `${product} ÷ ${n} = ?`,
                answer: b,
                hint: `Think: ${n} × ? = ${product}`,
                visual: null,
                meta: { operation: 'div', a: product, b: n, strategy: `times_${n}` },
            };
        }

        // Swap order occasionally for variety
        const swap = Math.random() < 0.3;
        const a1 = swap ? b : n;
        const a2 = swap ? n : b;

        return {
            questionText: `${a1} × ${a2} = ?`,
            answer: product,
            hint: level <= 2 ? `Count ${a1} groups of ${a2}` : null,
            visual: null,
            meta: { operation: 'mul', a: a1, b: a2, strategy: `times_${n}` },
        };
    },

    // ----- Custom Tables -----

    getCustomTables() {
        try {
            const raw = localStorage.getItem('mentalMaths_customTables');
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    },

    addCustomTable(n) {
        n = parseInt(n, 10);
        if (isNaN(n) || n < 1 || n > 999) return false;
        const all = this.getAllTableNumbers();
        if (all.includes(n)) return false;
        const custom = this.getCustomTables();
        custom.push(n);
        custom.sort((a, b) => a - b);
        localStorage.setItem('mentalMaths_customTables', JSON.stringify(custom));
        this._registerGenerator(n);
        return true;
    },

    removeCustomTable(n) {
        n = parseInt(n, 10);
        const custom = this.getCustomTables().filter(x => x !== n);
        localStorage.setItem('mentalMaths_customTables', JSON.stringify(custom));
        delete Generators[this.getTableId(n)];
    },

    // ----- Progress -----

    ensureProgress(playerId) {
        this.getAllTableNumbers().forEach(n => {
            const id = this.getTableId(n);
            if (!Storage.getStrategyProgress(playerId, id)) {
                Storage.updateStrategyProgress(playerId, id, {
                    strategyId: id, mastery: 0, level: 1,
                    totalAttempts: 0, totalCorrect: 0, streak: 0,
                    bestStreak: 0, avgTimeMs: 0, lastPracticed: null,
                    assessmentNotes: '',
                });
            }
        });
    },

    // ----- Session Planning -----

    getSessionPlan(playerId, tableNumber) {
        const id = this.getTableId(tableNumber);
        const plan = [];
        for (let i = 0; i < this.SESSION_LENGTH; i++) {
            plan.push({ strategyId: id });
        }
        return {
            strategy: { id, name: `${tableNumber}× Table`, shortName: `${tableNumber}×` },
            questions: plan,
        };
    },

    getAutoSessionPlan(playerId) {
        const table = this.selectTable(playerId);
        return this.getSessionPlan(playerId, table);
    },

    selectTable(playerId) {
        const tables = this.getAllTableNumbers();
        const now = Date.now();
        const weighted = tables.map(n => {
            const id = this.getTableId(n);
            const p = Storage.getStrategyProgress(playerId, id);
            const mastery = p ? (p.mastery || 0) : 0;
            const lastPracticed = p ? p.lastPracticed : null;
            const masteryWeight = Math.max(0, 100 - mastery);
            const daysSince = lastPracticed
                ? (now - new Date(lastPracticed).getTime()) / 86400000 : 30;
            const recencyWeight = Math.min(daysSince * 5, 50);
            return { number: n, weight: masteryWeight + recencyWeight };
        });
        weighted.sort((a, b) => b.weight - a.weight);
        const top = weighted.slice(0, 3);
        return pick(top).number;
    },

    // ----- Stats helpers -----

    getOverallProgress(playerId) {
        const tables = this.getAllTableNumbers();
        let totalMastery = 0, count = 0, totalAttempts = 0, totalCorrect = 0;
        tables.forEach(n => {
            const p = Storage.getStrategyProgress(playerId, this.getTableId(n));
            if (p) {
                totalMastery += (p.mastery || 0);
                totalAttempts += (p.totalAttempts || 0);
                totalCorrect += (p.totalCorrect || 0);
                count++;
            }
        });
        return {
            avgMastery: count > 0 ? Math.round(totalMastery / count) : 0,
            totalAttempts,
            totalCorrect,
            accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
        };
    },
};

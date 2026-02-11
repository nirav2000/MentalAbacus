/* engine.js - Adaptive difficulty engine
   Handles strategy selection, difficulty adjustment, mastery assessment,
   spaced repetition integration, and flagged question retry.
*/

const AdaptiveEngine = {
    FAST_TIME: 3000,     // ms - fluent
    OK_TIME: 8000,       // ms - developing
    SLOW_TIME: 15000,    // ms - struggling

    MASTERY_PROMOTE: 80,
    MASTERY_DEMOTE: 30,

    SESSION_LENGTH: 10,

    // Pick the best strategy for a player to practise
    selectStrategy(playerId) {
        const allProgress = Storage.getAllStrategyProgress(playerId);

        // Only consider unlocked strategies
        const unlocked = STRATEGIES.filter(s => {
            if (!s.unlockRequires) return true;
            const req = allProgress[s.unlockRequires];
            return req && req.mastery >= 50;
        });

        // Use SM-2 if enabled
        if (typeof SpacedRepetition !== 'undefined' && SpacedRepetition.isEnabled()) {
            return SpacedRepetition.selectStrategy(playerId, unlocked);
        }

        // Fallback: weight by mastery deficit + recency
        const now = Date.now();
        const weighted = unlocked.map(s => {
            const p = allProgress[s.id];
            const masteryWeight = Math.max(0, 100 - (p.mastery || 0));
            const daysSince = p.lastPracticed
                ? (now - new Date(p.lastPracticed).getTime()) / 86400000
                : 30;
            const recencyWeight = Math.min(daysSince * 5, 50);
            return { strategy: s, weight: masteryWeight + recencyWeight };
        });

        weighted.sort((a, b) => b.weight - a.weight);
        const top = weighted.slice(0, Math.min(3, weighted.length));
        return pick(top).strategy;
    },

    // Generate a question for a strategy at the player's current level
    generateQuestion(strategyId, playerId) {
        const progress = Storage.getStrategyProgress(playerId, strategyId);
        const level = progress ? progress.level : 1;
        const gen = Generators[strategyId];
        if (!gen) return null;
        return gen(level);
    },

    // Assess an answer and update mastery/level
    assessAnswer(playerId, strategyId, correct, timeMs) {
        const progress = Storage.getStrategyProgress(playerId, strategyId);
        if (!progress) return {};

        const updates = {
            totalAttempts: (progress.totalAttempts || 0) + 1,
            lastPracticed: new Date().toISOString(),
        };

        if (correct) {
            updates.totalCorrect = (progress.totalCorrect || 0) + 1;
            updates.streak = (progress.streak || 0) + 1;
            updates.bestStreak = Math.max(updates.streak, progress.bestStreak || 0);

            // Faster = more mastery gain
            let delta = timeMs <= this.FAST_TIME ? 8
                      : timeMs <= this.OK_TIME ? 4 : 2;
            if (updates.streak >= 5) delta += 2;

            updates.mastery = Math.min(100, (progress.mastery || 0) + delta);

            // Level up at high mastery
            if (updates.mastery >= this.MASTERY_PROMOTE && (progress.level || 1) < 5) {
                updates.level = (progress.level || 1) + 1;
                updates.mastery = 60; // partial reset for new level
            }
        } else {
            updates.totalCorrect = progress.totalCorrect || 0;
            updates.streak = 0;
            updates.mastery = Math.max(0, (progress.mastery || 0) - 8);

            // Level down if really struggling
            if (updates.mastery <= this.MASTERY_DEMOTE && (progress.level || 1) > 1) {
                updates.level = (progress.level || 1) - 1;
                updates.mastery = 50;
            }
        }

        // Rolling average time
        const prevAvg = progress.avgTimeMs || 5000;
        const prevCount = progress.totalAttempts || 0;
        updates.avgTimeMs = Math.round((prevAvg * prevCount + timeMs) / (prevCount + 1));

        // Assessment notes
        const accuracy = updates.totalCorrect / updates.totalAttempts;
        if (accuracy >= 0.9 && updates.avgTimeMs < this.FAST_TIME) {
            updates.assessmentNotes = 'Mastered - fast and accurate';
        } else if (accuracy >= 0.75) {
            updates.assessmentNotes = 'Good understanding, building fluency';
        } else if (accuracy >= 0.5) {
            updates.assessmentNotes = 'Developing - needs more scaffolded practice';
        } else {
            updates.assessmentNotes = 'Struggling - simplify and use visual aids';
        }

        Storage.updateStrategyProgress(playerId, strategyId, updates);

        // Update SM-2 data if enabled
        if (typeof SpacedRepetition !== 'undefined' && SpacedRepetition.isEnabled()) {
            const quality = SpacedRepetition.getQuality(correct, timeMs);
            SpacedRepetition.update(playerId, strategyId, quality);
        }

        return {
            correct,
            newMastery: updates.mastery,
            newLevel: updates.level || progress.level || 1,
            assessment: updates.assessmentNotes,
            shouldShowHint: !correct || timeMs > this.SLOW_TIME,
            shouldShowVisual: !correct || updates.mastery < 40,
        };
    },

    // Build a session plan: array of { strategyId }
    getSessionPlan(playerId, specificStrategy) {
        const plan = [];
        const main = specificStrategy || this.selectStrategy(playerId);

        // Check for flagged questions to retry (insert up to 2)
        const flagged = Storage.getFlaggedForStrategy(playerId, main.id);
        let flaggedCount = 0;

        for (let i = 0; i < this.SESSION_LENGTH; i++) {
            if (i < 2 && !specificStrategy) {
                // First 2 questions: warm-up with auto-selected
                plan.push({ strategyId: this.selectStrategy(playerId).id });
            } else if (flaggedCount < 2 && flaggedCount < flagged.length) {
                // Insert flagged retry questions
                plan.push({ strategyId: main.id, flaggedRetry: true });
                flaggedCount++;
            } else {
                plan.push({ strategyId: main.id });
            }
        }
        return { strategy: main, questions: plan };
    },

    // Should we show teaching aids for this strategy?
    shouldShowTeaching(playerId, strategyId) {
        const p = Storage.getStrategyProgress(playerId, strategyId);
        if (!p) return true;
        return p.totalAttempts === 0 || p.mastery < 20;
    },
};

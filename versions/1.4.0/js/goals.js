/* goals.js - Goal setting and progress tracking */

const Goals = {

    _key(playerId) {
        return `mentalMaths_goals_${playerId}`;
    },

    getAll(playerId) {
        try {
            const raw = localStorage.getItem(this._key(playerId));
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    save(playerId, goals) {
        localStorage.setItem(this._key(playerId), JSON.stringify(goals));
    },

    add(playerId, goal) {
        const goals = this.getAll(playerId);
        goal.id = 'goal_' + Date.now();
        goal.createdAt = new Date().toISOString();
        goal.completed = false;
        goals.push(goal);
        this.save(playerId, goals);
        return goal;
    },

    remove(playerId, goalId) {
        const goals = this.getAll(playerId).filter(g => g.id !== goalId);
        this.save(playerId, goals);
    },

    complete(playerId, goalId) {
        const goals = this.getAll(playerId);
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = true;
            goal.completedAt = new Date().toISOString();
            this.save(playerId, goals);
        }
    },

    // Check goal progress and auto-complete
    checkProgress(playerId) {
        const goals = this.getAll(playerId);
        const allProg = Storage.getAllStrategyProgress(playerId);
        let changed = false;

        goals.forEach(g => {
            if (g.completed) return;
            const prog = allProg[g.strategyId];
            if (prog && prog.mastery >= g.targetMastery) {
                g.completed = true;
                g.completedAt = new Date().toISOString();
                changed = true;
            }
        });

        if (changed) this.save(playerId, goals);
        return goals;
    },

    // Get progress percentage for a goal
    getProgress(playerId, goal) {
        const prog = Storage.getStrategyProgress(playerId, goal.strategyId);
        const mastery = prog ? prog.mastery : 0;
        return Math.min(100, Math.round((mastery / goal.targetMastery) * 100));
    },

    // Days remaining until deadline
    daysRemaining(goal) {
        if (!goal.deadline) return null;
        const now = new Date();
        const deadline = new Date(goal.deadline);
        return Math.ceil((deadline - now) / 86400000);
    },

    // Render goal cards for home screen
    renderGoals(playerId) {
        const goals = this.checkProgress(playerId);
        const active = goals.filter(g => !g.completed);
        if (!active.length) return '';

        let html = '<div class="goals-section"><h3 class="goals-title">Your Goals</h3>';
        active.forEach(g => {
            const strat = STRATEGIES.find(s => s.id === g.strategyId);
            const progress = this.getProgress(playerId, g);
            const daysLeft = this.daysRemaining(g);
            const color = progress >= 75 ? 'var(--success)' : progress >= 40 ? 'var(--warning)' : 'var(--accent)';

            html += `
            <div class="goal-card">
                <div class="goal-header">
                    <span class="goal-name">${g.description || `Master ${strat ? strat.shortName : g.strategyId}`}</span>
                    <button class="btn-goal-remove" data-goal-id="${g.id}" title="Remove goal">&times;</button>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width:${progress}%;background:${color};"></div>
                </div>
                <div class="goal-meta">
                    <span>${progress}% complete</span>
                    ${daysLeft !== null ? `<span>${daysLeft > 0 ? daysLeft + ' days left' : 'Overdue!'}</span>` : ''}
                </div>
            </div>`;
        });
        html += '</div>';
        return html;
    },

    // Render goal creation form
    renderGoalForm(playerId) {
        let options = '';
        STRATEGIES.forEach(s => {
            options += `<option value="${s.id}">${s.name}</option>`;
        });

        return `
        <div class="goal-form">
            <h3>Set a New Goal</h3>
            <div class="goal-form-row">
                <label>Strategy</label>
                <select id="goal-strategy">${options}</select>
            </div>
            <div class="goal-form-row">
                <label>Target Mastery</label>
                <select id="goal-target">
                    <option value="50">50% (Developing)</option>
                    <option value="70">70% (Good)</option>
                    <option value="80" selected>80% (Strong)</option>
                    <option value="100">100% (Mastered)</option>
                </select>
            </div>
            <div class="goal-form-row">
                <label>Deadline (optional)</label>
                <input type="date" id="goal-deadline" min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="goal-form-row">
                <label>Description (optional)</label>
                <input type="text" id="goal-description" placeholder="e.g. Master Doubles this week" maxlength="50">
            </div>
            <button class="btn btn-primary" id="btn-save-goal">Save Goal</button>
        </div>`;
    },

    // Render completed goals
    renderCompleted(playerId) {
        const goals = this.getAll(playerId);
        const completed = goals.filter(g => g.completed);
        if (!completed.length) return '';

        let html = '<div class="goals-section"><h3 class="goals-title">Completed Goals</h3>';
        completed.slice(-5).reverse().forEach(g => {
            const strat = STRATEGIES.find(s => s.id === g.strategyId);
            html += `
            <div class="goal-card completed">
                <span class="goal-check">&#10003;</span>
                <span class="goal-name">${g.description || `Master ${strat ? strat.shortName : g.strategyId}`}</span>
                <span class="goal-date">${new Date(g.completedAt).toLocaleDateString('en-GB')}</span>
            </div>`;
        });
        html += '</div>';
        return html;
    },
};

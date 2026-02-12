/* teacher-dashboard.js - Teacher/parent dashboard for all-player overview */

const TeacherDashboard = {

    // Render the full teacher dashboard
    render() {
        const players = Storage.getPlayers();
        if (!players.length) {
            return '<p style="color:var(--text-muted);text-align:center;padding:40px;">No students yet. Add players from the welcome screen.</p>';
        }

        let html = '';

        // Overview cards
        html += '<div class="teacher-section"><h3>Student Overview</h3>';
        html += '<div class="teacher-grid">';
        const playerData = players.map(p => {
            const profile = Storage.getProfile(p.id);
            const allProg = Storage.getAllStrategyProgress(p.id);
            const totalMastery = this._avgMastery(allProg);
            const accuracy = profile && profile.totalQuestions > 0
                ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;
            const weakest = this._weakestStrategy(allProg);
            const flagged = Storage.getFlaggedQuestions ? Storage.getFlaggedQuestions(p.id).length : 0;
            return { player: p, profile, allProg, totalMastery, accuracy, weakest, flagged };
        });

        // Sort by mastery ascending (struggling students first)
        const sorted = [...playerData].sort((a, b) => a.totalMastery - b.totalMastery);

        sorted.forEach(d => {
            const status = d.totalMastery >= 70 ? 'good' : d.totalMastery >= 40 ? 'developing' : 'struggling';
            html += `
            <div class="teacher-card status-${status}">
                <div class="teacher-card-header">
                    <span class="teacher-student-name">${d.player.name}</span>
                    <span class="teacher-status-badge ${status}">${status}</span>
                </div>
                <div class="teacher-card-stats">
                    <div class="teacher-stat"><span class="val">${d.totalMastery}%</span><span class="lbl">Mastery</span></div>
                    <div class="teacher-stat"><span class="val">${d.accuracy}%</span><span class="lbl">Accuracy</span></div>
                    <div class="teacher-stat"><span class="val">${d.profile?.totalSessions || 0}</span><span class="lbl">Sessions</span></div>
                    <div class="teacher-stat"><span class="val">${d.flagged}</span><span class="lbl">Flagged</span></div>
                </div>
                ${d.weakest ? `<div class="teacher-card-weak">Focus area: <strong>${d.weakest}</strong></div>` : ''}
            </div>`;
        });
        html += '</div></div>';

        // Comparison chart
        html += '<div class="teacher-section"><h3>Mastery Comparison</h3>';
        html += Charts.barChart(
            playerData.map(d => ({
                label: d.player.name,
                value: d.totalMastery,
                max: 100,
                displayValue: d.totalMastery,
                suffix: '%',
                color: d.totalMastery >= 70 ? 'var(--success)' : d.totalMastery >= 40 ? 'var(--warning)' : 'var(--error)',
            })),
            { width: 340 }
        );
        html += '</div>';

        // Per-strategy comparison
        html += '<div class="teacher-section"><h3>Strategy Breakdown</h3>';
        html += '<div class="teacher-strategy-select">';
        html += '<select id="teacher-strategy-filter" class="teacher-select">';
        html += '<option value="all">All Strategies</option>';
        STRATEGIES.forEach(s => {
            html += `<option value="${s.id}">${s.shortName}</option>`;
        });
        html += '</select></div>';
        html += '<div id="teacher-strategy-chart">';
        html += this._strategyComparison(playerData, 'all');
        html += '</div></div>';

        // Struggling students alert
        const struggling = sorted.filter(d => d.totalMastery < 40);
        if (struggling.length) {
            html += '<div class="teacher-section teacher-alert"><h3>&#x26a0; Needs Attention</h3>';
            struggling.forEach(d => {
                html += `<div class="teacher-alert-row">
                    <strong>${d.player.name}</strong> — ${d.totalMastery}% mastery, ${d.accuracy}% accuracy
                    ${d.weakest ? `(weakest: ${d.weakest})` : ''}
                </div>`;
            });
            html += '</div>';
        }

        // Manage Modules — unlock locked strategies per student
        html += '<div class="teacher-section"><h3>Manage Modules</h3>';
        html += '<div class="teacher-strategy-select">';
        html += '<select id="teacher-unlock-player" class="teacher-select">';
        players.forEach(p => {
            html += `<option value="${p.id}">${p.name}</option>`;
        });
        html += '</select></div>';
        html += '<div id="teacher-unlock-grid"></div>';
        html += '</div>';

        return html;
    },

    bindEvents(container) {
        const select = container.querySelector('#teacher-strategy-filter');
        if (select) {
            select.addEventListener('change', () => {
                const chart = container.querySelector('#teacher-strategy-chart');
                const players = Storage.getPlayers();
                const playerData = players.map(p => {
                    const profile = Storage.getProfile(p.id);
                    const allProg = Storage.getAllStrategyProgress(p.id);
                    return { player: p, profile, allProg };
                });
                chart.innerHTML = this._strategyComparison(playerData, select.value);
            });
        }

        // Manage modules: player selector and unlock toggles
        const unlockSelect = container.querySelector('#teacher-unlock-player');
        const unlockGrid = container.querySelector('#teacher-unlock-grid');
        if (unlockSelect && unlockGrid) {
            const renderUnlockGrid = (playerId) => {
                unlockGrid.innerHTML = this._renderUnlockGrid(playerId);
                unlockGrid.querySelectorAll('.unlock-toggle input').forEach(toggle => {
                    toggle.addEventListener('change', () => {
                        Storage.setTeacherUnlock(playerId, toggle.dataset.strategyId, toggle.checked);
                    });
                });
            };
            renderUnlockGrid(unlockSelect.value);
            unlockSelect.addEventListener('change', () => renderUnlockGrid(unlockSelect.value));
        }
    },

    _strategyComparison(playerData, strategyId) {
        if (strategyId === 'all') {
            return Charts.barChart(
                playerData.map(d => ({
                    label: d.player.name,
                    value: this._avgMastery(d.allProg),
                    max: 100,
                    displayValue: this._avgMastery(d.allProg),
                    suffix: '%',
                    color: 'var(--accent)',
                })),
                { width: 340 }
            );
        }
        return Charts.barChart(
            playerData.map(d => {
                const p = d.allProg[strategyId];
                const mastery = p ? p.mastery : 0;
                return {
                    label: d.player.name,
                    value: mastery,
                    max: 100,
                    displayValue: mastery,
                    suffix: '%',
                    color: mastery >= 70 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)',
                };
            }),
            { width: 340 }
        );
    },

    _avgMastery(allProg) {
        const vals = Object.values(allProg).map(p => p.mastery || 0);
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    },

    _weakestStrategy(allProg) {
        let worst = null, worstMastery = Infinity;
        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            if (p && p.totalAttempts > 0 && (p.mastery || 0) < worstMastery) {
                worstMastery = p.mastery || 0;
                worst = s.shortName;
            }
        });
        return worst;
    },

    _renderUnlockGrid(playerId) {
        const allProg = Storage.getAllStrategyProgress(playerId);
        let html = '<div class="unlock-grid">';
        STRATEGIES.forEach(s => {
            if (!s.unlockRequires) return; // Skip strategies with no lock
            const req = allProg[s.unlockRequires];
            const masteryUnlocked = req && req.mastery >= 50;
            const teacherUnlocked = Storage.isTeacherUnlocked(playerId, s.id);
            const status = masteryUnlocked ? 'mastery' : teacherUnlocked ? 'teacher' : 'locked';
            const reqStrat = STRATEGIES.find(x => x.id === s.unlockRequires);

            html += `<div class="unlock-row">
                <div class="unlock-info">
                    <span class="unlock-name">${s.shortName}</span>
                    <span class="unlock-req">Requires: ${reqStrat ? reqStrat.shortName : s.unlockRequires} 50%</span>
                    <span class="unlock-status-badge ${status}">${status === 'mastery' ? 'Earned' : status === 'teacher' ? 'Teacher unlock' : 'Locked'}</span>
                </div>
                <label class="toggle unlock-toggle">
                    <input type="checkbox" data-strategy-id="${s.id}" ${(masteryUnlocked || teacherUnlocked) ? 'checked' : ''} ${masteryUnlocked ? 'disabled' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>`;
        });
        html += '</div>';
        return html;
    },
};

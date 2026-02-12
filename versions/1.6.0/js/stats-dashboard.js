/* stats-dashboard.js - Enhanced visual stats dashboard */

const StatsDashboard = {

    render(playerId) {
        const profile = Storage.getProfile(playerId);
        const allProg = Storage.getAllStrategyProgress(playerId);
        const sessions = Storage.getSessions(playerId);
        const flagged = Storage.getFlaggedQuestions ? Storage.getFlaggedQuestions(playerId) : [];
        const accuracy = profile.totalQuestions > 0
            ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;

        let html = '';

        // Overview
        html += `<div class="stats-section"><h3>Overview</h3>
            <div class="stats-overview">
                <div class="stat-box"><div class="stat-value">${profile.totalSessions || 0}</div><div class="stat-label">Sessions</div></div>
                <div class="stat-box"><div class="stat-value">${profile.totalQuestions || 0}</div><div class="stat-label">Questions</div></div>
                <div class="stat-box"><div class="stat-value">${accuracy}%</div><div class="stat-label">Accuracy</div></div>
                <div class="stat-box"><div class="stat-value">${profile.totalCorrect || 0}</div><div class="stat-label">Correct</div></div>
            </div>
        </div>`;

        // Weakest strategy indicator
        const weakest = this._findWeakest(allProg);
        if (weakest) {
            html += `<div class="stats-section stats-weak-alert">
                <div class="weak-indicator">
                    <span class="weak-icon">&#x1f3af;</span>
                    <div class="weak-info">
                        <div class="weak-title">Focus Area: ${weakest.name}</div>
                        <div class="weak-detail">${weakest.mastery}% mastery · ${weakest.accuracy}% accuracy</div>
                    </div>
                </div>
            </div>`;
        }

        // Accuracy by strategy bar chart
        html += '<div class="stats-section"><h3>Accuracy by Strategy</h3>';
        const barData = [];
        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            if (p && p.totalAttempts > 0) {
                const sAcc = Math.round((p.totalCorrect / p.totalAttempts) * 100);
                barData.push({
                    label: s.shortName,
                    value: sAcc,
                    max: 100,
                    displayValue: sAcc,
                    suffix: '%',
                    color: sAcc >= 80 ? 'var(--success)' : sAcc >= 50 ? 'var(--warning)' : 'var(--error)',
                });
            }
        });
        if (barData.length) {
            html += Charts.barChart(barData);
        } else {
            html += '<p style="color:var(--text-muted);font-size:0.85rem;">No data yet. Start practising!</p>';
        }
        html += '</div>';

        // Response time trends per strategy
        html += '<div class="stats-section"><h3>Speed by Strategy</h3>';
        const timeData = [];
        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            if (p && p.totalAttempts > 0 && p.avgTimeMs) {
                timeData.push({
                    label: s.shortName,
                    value: p.avgTimeMs / 1000,
                    max: 15,
                    displayValue: (p.avgTimeMs / 1000).toFixed(1),
                    suffix: 's',
                    color: p.avgTimeMs <= 3000 ? 'var(--success)' : p.avgTimeMs <= 8000 ? 'var(--warning)' : 'var(--error)',
                });
            }
        });
        if (timeData.length) {
            html += Charts.barChart(timeData);
        } else {
            html += '<p style="color:var(--text-muted);font-size:0.85rem;">No time data yet.</p>';
        }
        html += '</div>';

        // Improvement over time (line chart from session data)
        if (sessions.length >= 2) {
            html += '<div class="stats-section"><h3>Improvement Over Time</h3>';
            const labels = [];
            const accData = [];
            const timeSeriesData = [];
            sessions.slice(-20).forEach((s, i) => {
                labels.push(`S${i + 1}`);
                const sAcc = s.totalAnswered > 0 ? Math.round((s.totalCorrect / s.totalAnswered) * 100) : 0;
                accData.push(sAcc);
                timeSeriesData.push(s.avgTimeMs ? Math.round(s.avgTimeMs / 1000) : 0);
            });

            html += Charts.lineChart({
                labels,
                datasets: [
                    { label: 'Accuracy %', data: accData, color: 'var(--success)' },
                ],
            });

            html += '<div style="margin-top:12px;">';
            html += '<p style="color:var(--text-muted);font-size:0.75rem;margin-bottom:4px;">Avg Response Time (s)</p>';
            html += Charts.lineChart({
                labels,
                datasets: [
                    { label: 'Time (s)', data: timeSeriesData, color: 'var(--warning)' },
                ],
            }, { height: 120 });
            html += '</div></div>';
        }

        // Strategy mastery detail with question history dropdown
        html += '<div class="stats-section"><h3>Strategy Progress</h3>';
        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            const mastery = p?.mastery || 0;
            const barColor = mastery >= 80 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)';
            const avgTime = p?.avgTimeMs ? `${(p.avgTimeMs / 1000).toFixed(1)}s` : '—';
            const timeHistory = this._getTimeHistory(playerId, s.id, sessions);

            html += `
            <div class="stats-strategy-row strategy-expandable" data-strategy-id="${s.id}" data-player-id="${playerId}">
                <div class="strategy-row-main">
                    <div class="name">${s.shortName} <span style="color:var(--text-muted);font-size:0.75rem;">L${p?.level || 1}</span></div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:0.75rem;color:var(--text-muted);">${avgTime}</span>
                        ${timeHistory.length >= 2 ? Charts.sparkline(timeHistory, { width: 50, height: 18, color: barColor }) : ''}
                        <div class="mastery">${mastery}%</div>
                        <div class="bar-container"><div class="bar-fill" style="width:${mastery}%;background:${barColor};"></div></div>
                        <span class="strategy-expand-arrow">&#x25bc;</span>
                    </div>
                </div>
                <div class="strategy-question-detail hidden" id="strat-detail-${s.id}"></div>
            </div>`;
        });
        html += '</div>';

        // Times tables progress
        TimesTables.ensureProgress(playerId);
        const ttTables = TimesTables.getAllTableNumbers();
        const ttWithData = ttTables.filter(n => {
            const p = Storage.getStrategyProgress(playerId, TimesTables.getTableId(n));
            return p && p.totalAttempts > 0;
        });
        if (ttWithData.length > 0) {
            const ttOverview = TimesTables.getOverallProgress(playerId);
            html += `<div class="stats-section"><h3>Times Tables</h3>
                <div class="stats-overview" style="margin-bottom:12px;">
                    <div class="stat-box"><div class="stat-value">${ttOverview.avgMastery}%</div><div class="stat-label">Avg Mastery</div></div>
                    <div class="stat-box"><div class="stat-value">${ttOverview.accuracy}%</div><div class="stat-label">Accuracy</div></div>
                </div>`;
            ttWithData.forEach(n => {
                const id = TimesTables.getTableId(n);
                const p = Storage.getStrategyProgress(playerId, id);
                const mastery = p?.mastery || 0;
                const barColor = mastery >= 80 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)';
                const avgTime = p?.avgTimeMs ? `${(p.avgTimeMs / 1000).toFixed(1)}s` : '—';

                html += `
                <div class="stats-strategy-row strategy-expandable" data-strategy-id="${id}" data-player-id="${playerId}">
                    <div class="strategy-row-main">
                        <div class="name">${n}× <span style="color:var(--text-muted);font-size:0.75rem;">L${p?.level || 1}</span></div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:0.75rem;color:var(--text-muted);">${avgTime}</span>
                            <div class="mastery">${mastery}%</div>
                            <div class="bar-container"><div class="bar-fill" style="width:${mastery}%;background:${barColor};"></div></div>
                            <span class="strategy-expand-arrow">&#x25bc;</span>
                        </div>
                    </div>
                    <div class="strategy-question-detail hidden" id="strat-detail-${id}"></div>
                </div>`;
            });
            html += '</div>';
        }

        // Flagged questions
        if (flagged.length > 0) {
            html += '<div class="stats-section"><h3>&#x1f6a9; Flagged for Review</h3>';
            html += '<div class="flagged-list">';
            flagged.slice(-20).reverse().forEach(q => {
                const strat = STRATEGIES.find(s => s.id === q.strategyId);
                const stratLabel = strat ? strat.shortName : TimesTables.isTimesTable(q.strategyId) ? TimesTables.getTableNumber(q.strategyId) + '×' : '';
                html += `
                <div class="flagged-row">
                    <span class="flagged-question">${q.questionText}</span>
                    <span class="flagged-strategy">${stratLabel}</span>
                    <span class="flagged-answer">You: ${q.userAnswer} · Correct: ${q.correctAnswer}</span>
                </div>`;
            });
            html += '</div></div>';
        }

        // Recent sessions with drill-down
        html += '<div class="stats-section"><h3>Recent Sessions</h3><div class="session-log">';
        const recent = sessions.slice(-10).reverse();
        if (!recent.length) {
            html += '<p style="color:var(--text-muted);font-size:0.85rem;">No sessions yet.</p>';
        }
        recent.forEach(s => {
            const date = new Date(s.timestamp).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            let name = STRATEGIES.find(x => x.id === s.strategyFocus)?.shortName;
            if (!name && TimesTables.isTimesTable(s.strategyFocus)) name = TimesTables.getTableNumber(s.strategyFocus) + '×';
            if (!name) name = 'Mixed';
            const pct = s.totalAnswered > 0 ? Math.round((s.totalCorrect / s.totalAnswered) * 100) : 0;

            html += `<div class="log-entry session-expandable" data-session-id="${s.id}" data-player-id="${s.playerId || ''}">
                <div class="log-main">
                    <div>
                        <div class="log-date">${date}</div>
                        <div class="log-summary">${name} · ${s.totalCorrect || 0}/${s.totalAnswered || 0} (${pct}%)${s.avgTimeMs ? ` · ${(s.avgTimeMs / 1000).toFixed(1)}s avg` : ''}</div>
                    </div>
                    <span class="log-expand-arrow">&#x25bc;</span>
                </div>
                <div class="log-detail hidden" id="detail-${s.id}"></div>
            </div>`;
        });
        html += '</div></div>';

        // Goals
        const goalsHtml = Goals.renderGoals(playerId);
        const completedGoals = Goals.renderCompleted(playerId);
        if (goalsHtml || completedGoals) {
            html += goalsHtml + completedGoals;
        }

        return html;
    },

    bindEvents(container, playerId) {
        // Strategy question history drill-down
        container.querySelectorAll('.strategy-expandable').forEach(row => {
            row.querySelector('.strategy-row-main').addEventListener('click', () => {
                const stratId = row.dataset.strategyId;
                const detail = row.querySelector('.strategy-question-detail');
                const arrow = row.querySelector('.strategy-expand-arrow');

                if (!detail.classList.contains('hidden')) {
                    detail.classList.add('hidden');
                    arrow.innerHTML = '&#x25bc;';
                    return;
                }

                const questions = Storage.getQuestionLogByStrategy(playerId, stratId);
                if (questions.length === 0) {
                    detail.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:8px;">No questions asked yet.</p>';
                } else {
                    detail.innerHTML = this._renderQuestionHistory(questions);
                }

                detail.classList.remove('hidden');
                arrow.innerHTML = '&#x25b2;';
            });
        });

        // Session drill-down
        container.querySelectorAll('.session-expandable').forEach(entry => {
            entry.querySelector('.log-main').addEventListener('click', () => {
                const sessionId = entry.dataset.sessionId;
                const detail = entry.querySelector('.log-detail');
                const arrow = entry.querySelector('.log-expand-arrow');

                if (!detail.classList.contains('hidden')) {
                    detail.classList.add('hidden');
                    arrow.innerHTML = '&#x25bc;';
                    return;
                }

                // Load session questions
                const session = Storage.getSession(playerId, sessionId);
                if (session && session.questions) {
                    let rows = '';
                    session.questions.forEach(qId => {
                        const q = Storage._read(`players/${playerId}/questionLog/${qId}`);
                        if (q) {
                            rows += `
                            <div class="drill-row">
                                <span class="drill-q">${q.questionText}</span>
                                <span class="drill-answer ${q.correct ? 'correct' : 'incorrect'}">${q.userAnswer}${!q.correct ? ` (${q.correctAnswer})` : ''}</span>
                                <span class="drill-time">${(q.timeMs / 1000).toFixed(1)}s</span>
                            </div>`;
                        }
                    });
                    detail.innerHTML = rows || '<p style="color:var(--text-muted);font-size:0.8rem;padding:8px;">No question details available.</p>';
                } else {
                    detail.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;padding:8px;">No question details available.</p>';
                }

                detail.classList.remove('hidden');
                arrow.innerHTML = '&#x25b2;';
            });
        });

        // Goal removal
        container.querySelectorAll('.btn-goal-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                Goals.remove(playerId, btn.dataset.goalId);
                App.showStats();
            });
        });
    },

    _findWeakest(allProg) {
        let worst = null, worstMastery = Infinity;
        STRATEGIES.forEach(s => {
            const p = allProg[s.id];
            if (p && p.totalAttempts > 0 && (p.mastery || 0) < worstMastery) {
                worstMastery = p.mastery || 0;
                worst = {
                    name: s.shortName,
                    id: s.id,
                    mastery: worstMastery,
                    accuracy: p.totalAttempts > 0 ? Math.round((p.totalCorrect / p.totalAttempts) * 100) : 0,
                };
            }
        });
        return worst;
    },

    _getTimeHistory(playerId, strategyId, sessions) {
        // Extract avg times from sessions that focused on this strategy
        const times = [];
        sessions.forEach(s => {
            if (s.strategyFocus === strategyId && s.avgTimeMs) {
                times.push(Math.round(s.avgTimeMs / 1000));
            }
        });
        return times.slice(-10);
    },

    _renderQuestionHistory(questions) {
        // Group questions by questionText
        const grouped = {};
        questions.forEach(q => {
            if (!grouped[q.questionText]) {
                grouped[q.questionText] = { total: 0, correct: 0, totalTimeMs: 0 };
            }
            const g = grouped[q.questionText];
            g.total++;
            if (q.correct) g.correct++;
            g.totalTimeMs += q.timeMs || 0;
        });

        // Sort by total attempts descending
        const entries = Object.entries(grouped)
            .sort((a, b) => b[1].total - a[1].total);

        let html = '<div class="question-history">';
        html += '<div class="qh-header"><span class="qh-col-q">Question</span><span class="qh-col-n">Asked</span><span class="qh-col-acc">Correct</span><span class="qh-col-time">Avg Time</span></div>';
        entries.forEach(([text, data]) => {
            const pct = Math.round((data.correct / data.total) * 100);
            const avgT = data.total > 0 ? (data.totalTimeMs / data.total / 1000).toFixed(1) : '—';
            const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)';
            html += `<div class="qh-row">
                <span class="qh-col-q">${text}</span>
                <span class="qh-col-n">${data.total}x</span>
                <span class="qh-col-acc" style="color:${color};">${data.correct}/${data.total} (${pct}%)</span>
                <span class="qh-col-time">${avgT}s</span>
            </div>`;
        });
        html += '</div>';
        return html;
    },
};

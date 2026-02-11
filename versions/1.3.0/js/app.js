/* app.js - Main UI controller */

const App = {
    currentPlayer: null,
    currentQuestion: null,
    currentAnswer: '',
    questionStartTime: null,
    sessionQuestions: [],
    sessionIndex: 0,
    sessionResults: [],
    sessionAskedTexts: new Set(),
    streak: 0,
    sessionId: null,
    showingFeedback: false,
    hintShownForCurrent: false,
    practiceMode: false,
    isDailyChallenge: false,
    exportMenuOpen: false,

    init() {
        document.querySelectorAll('[id^="version-"]').forEach(el => {
            el.textContent = `v${APP_VERSION}`;
        });
        this.bindEvents();
        this.renderPlayerList();
        this.showScreen('screen-welcome');
        this.registerServiceWorker();
    },

    // ----- PWA -----

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(() => {});
        }
    },

    // ----- Navigation -----

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById(id);
        if (el) el.classList.add('active');
    },

    // ----- Events -----

    bindEvents() {
        // Welcome
        document.getElementById('btn-add-player').addEventListener('click', () => this.addPlayer());
        document.getElementById('new-player-name').addEventListener('keydown', e => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('btn-teacher-dashboard').addEventListener('click', () => this.openTeacherDashboard());

        // Home
        document.getElementById('btn-back-welcome').addEventListener('click', () => {
            this.currentPlayer = null;
            this.showScreen('screen-welcome');
        });
        document.getElementById('btn-practice').addEventListener('click', () => this.startPractice());
        document.getElementById('btn-stats').addEventListener('click', () => this.showStats());
        document.getElementById('btn-settings').addEventListener('click', () => this.showSettings());
        document.getElementById('btn-goals').addEventListener('click', () => this.showGoals());

        // Quiz
        document.getElementById('btn-quit-quiz').addEventListener('click', () => this.quitQuiz());
        document.getElementById('numpad').addEventListener('click', e => {
            const btn = e.target.closest('.numpad-btn');
            if (btn) this.handleNumpad(btn.dataset.val);
        });

        // Summary
        document.getElementById('btn-summary-home').addEventListener('click', () => {
            this.showScreen('screen-home');
            this.renderHome();
        });

        // Stats
        document.getElementById('btn-back-home').addEventListener('click', () => this.showScreen('screen-home'));
        document.getElementById('btn-export-data').addEventListener('click', () => this.toggleExportMenu());

        // Settings
        document.getElementById('btn-back-from-settings').addEventListener('click', () => this.showScreen('screen-home'));

        // Goals
        document.getElementById('btn-back-from-goals').addEventListener('click', () => this.showScreen('screen-home'));

        // Teacher dashboard
        document.getElementById('btn-back-from-teacher').addEventListener('click', () => {
            this.showScreen(this.currentPlayer ? 'screen-home' : 'screen-welcome');
        });

        // Version history
        document.querySelectorAll('.version-link').forEach(el => {
            el.addEventListener('click', () => this.showVersions());
        });
        document.getElementById('btn-back-from-versions').addEventListener('click', () => {
            this.showScreen(this.currentPlayer ? 'screen-home' : 'screen-welcome');
        });

        // Keyboard
        document.addEventListener('keydown', e => {
            if (!document.getElementById('screen-quiz').classList.contains('active')) return;
            if (e.key >= '0' && e.key <= '9') this.handleNumpad(e.key);
            else if (e.key === 'Backspace') this.handleNumpad('del');
            else if (e.key === 'Enter') this.handleNumpad('go');
        });

        // Close export menu on outside click
        document.addEventListener('click', e => {
            if (this.exportMenuOpen && !e.target.closest('#btn-export-data') && !e.target.closest('.export-menu')) {
                this.closeExportMenu();
            }
        });
    },

    // ----- Players -----

    addPlayer() {
        const input = document.getElementById('new-player-name');
        const name = input.value.trim();
        if (!name) return;
        Storage.addPlayer(name);
        input.value = '';
        this.renderPlayerList();
    },

    renderPlayerList() {
        const list = document.getElementById('player-list');
        const players = Storage.getPlayers();
        list.innerHTML = '';
        players.forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'btn player-btn';
            const profile = Storage.getProfile(p.id);
            const totalQ = profile ? profile.totalQuestions || 0 : 0;
            btn.innerHTML = `<span>${p.name}</span><span class="player-level">${totalQ} questions done</span>`;
            btn.addEventListener('click', () => this.selectPlayer(p));
            list.appendChild(btn);
        });
    },

    selectPlayer(player) {
        this.currentPlayer = player;
        this.showScreen('screen-home');
        this.renderHome();
    },

    // ----- Home -----

    renderHome() {
        if (!this.currentPlayer) return;
        document.getElementById('player-greeting').textContent = `Hi, ${this.currentPlayer.name}!`;

        const homeContent = document.getElementById('home-content-area');
        let html = '';

        // Daily challenge card
        if (Settings.get('dailyChallengeReminder', true)) {
            html += DailyChallenge.renderCard(this.currentPlayer.id);
        }

        // Active goals
        html += Goals.renderGoals(this.currentPlayer.id);

        homeContent.innerHTML = html;

        // Bind daily challenge click
        const dailyBtn = document.getElementById('btn-daily-challenge');
        if (dailyBtn) {
            dailyBtn.addEventListener('click', () => this.startDailyChallenge());
        }

        // Bind goal removal
        homeContent.querySelectorAll('.btn-goal-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                Goals.remove(this.currentPlayer.id, btn.dataset.goalId);
                this.renderHome();
            });
        });

        // Strategy grid
        const grid = document.getElementById('strategy-grid');
        grid.innerHTML = '';
        const allProg = Storage.getAllStrategyProgress(this.currentPlayer.id);

        STRATEGIES.forEach(s => {
            const prog = allProg[s.id];
            const mastery = prog?.mastery || 0;
            const unlocked = !s.unlockRequires || (allProg[s.unlockRequires]?.mastery >= 50);

            const card = document.createElement('div');
            card.className = 'strategy-card' + (unlocked ? '' : ' locked');

            const barColor = mastery >= 80 ? 'var(--success)' : mastery >= 40 ? 'var(--warning)' : 'var(--error)';
            card.innerHTML = `
                <div class="strategy-name">${s.shortName}</div>
                <div class="strategy-mastery">${unlocked ? `L${prog?.level || 1} · ${mastery}%` : 'Locked'}</div>
                <div class="mastery-bar"><div class="mastery-bar-fill" style="width:${mastery}%;background:${barColor};"></div></div>
            `;
            if (unlocked) card.addEventListener('click', () => this.startPractice(s));
            grid.appendChild(card);
        });
    },

    // ----- Quiz -----

    startPractice(specificStrategy, options = {}) {
        const pid = this.currentPlayer.id;
        this.practiceMode = options.practiceMode || false;
        this.isDailyChallenge = options.dailyChallenge || false;

        let plan;
        if (options.dailyChallenge) {
            const dailyPlan = DailyChallenge.generatePlan(pid);
            plan = { strategy: { id: 'daily', name: 'Daily Challenge' }, questions: dailyPlan };
        } else {
            plan = AdaptiveEngine.getSessionPlan(pid, specificStrategy);
        }

        this.sessionQuestions = plan.questions;
        this.sessionIndex = 0;
        this.sessionResults = [];
        this.sessionAskedTexts = new Set();
        this.streak = 0;
        Intervention.reset();

        this.sessionId = Storage.logSession(pid, {
            strategyFocus: specificStrategy ? specificStrategy.id : (this.isDailyChallenge ? 'daily' : 'auto'),
            startTime: new Date().toISOString(),
            totalQuestions: plan.questions.length,
            completed: false,
        });

        // Practice mode banner
        const banner = document.getElementById('practice-mode-banner');
        if (banner) banner.classList.toggle('hidden', !this.practiceMode);

        this.showScreen('screen-quiz');
        this.nextQuestion();
    },

    startDailyChallenge() {
        if (DailyChallenge.isCompletedToday(this.currentPlayer.id)) return;
        this.startPractice(null, { dailyChallenge: true });
    },

    startPracticeMode(strategyId) {
        const strat = STRATEGIES.find(s => s.id === strategyId);
        if (strat) this.startPractice(strat, { practiceMode: true });
    },

    nextQuestion() {
        if (this.sessionIndex >= this.sessionQuestions.length) {
            this.endSession();
            return;
        }

        const qPlan = this.sessionQuestions[this.sessionIndex];
        let question = null;
        for (let tries = 0; tries < 20; tries++) {
            const q = AdaptiveEngine.generateQuestion(qPlan.strategyId, this.currentPlayer.id);
            if (!q) break;
            if (!this.sessionAskedTexts.has(q.questionText) || tries === 19) {
                question = q;
                break;
            }
        }
        if (!question) { this.sessionIndex++; this.nextQuestion(); return; }
        this.sessionAskedTexts.add(question.questionText);

        this.currentQuestion = { ...question, strategyId: qPlan.strategyId };
        this.currentAnswer = '';
        this.questionStartTime = Date.now();
        this.showingFeedback = false;
        this.hintShownForCurrent = false;

        // Update header
        const strat = STRATEGIES.find(s => s.id === qPlan.strategyId);
        document.getElementById('quiz-strategy-name').textContent = this.isDailyChallenge ? 'Daily Challenge' : (strat?.name || '');
        document.getElementById('quiz-progress').textContent = `${this.sessionIndex + 1} / ${this.sessionQuestions.length}`;
        document.getElementById('quiz-streak').innerHTML = `&#x1f525; ${this.streak}`;
        document.getElementById('quiz-question').textContent = question.questionText;
        document.getElementById('quiz-answer-display').innerHTML = '&nbsp;';

        // Avatar
        this.updateAvatar('neutral');

        // Teaching aids
        const shouldTeach = AdaptiveEngine.shouldShowTeaching(this.currentPlayer.id, qPlan.strategyId);
        const hintEl = document.getElementById('quiz-hint');
        const visualEl = document.getElementById('quiz-visual');

        if (shouldTeach && question.hint) {
            hintEl.textContent = question.hint;
            hintEl.classList.remove('hidden');
            this.hintShownForCurrent = true;
        } else {
            hintEl.classList.add('hidden');
        }

        if (shouldTeach && question.visual) {
            visualEl.innerHTML = VisualRenderer.render(question.visual);
            visualEl.classList.remove('hidden');
            visualEl.classList.add('quiz-visual-large');
            VisualRenderer.bindInteractions(visualEl);
        } else {
            visualEl.classList.add('hidden');
        }

        // Hide feedback & encouragement
        const fb = document.getElementById('quiz-feedback');
        fb.classList.add('hidden');
        fb.classList.remove('correct', 'incorrect');
        const enc = document.getElementById('quiz-encouragement');
        if (enc) enc.classList.remove('visible');
    },

    handleNumpad(val) {
        if (this.showingFeedback) return;
        if (val === 'del') {
            this.currentAnswer = this.currentAnswer.slice(0, -1);
        } else if (val === 'go') {
            if (this.currentAnswer === '') return;
            this.submitAnswer();
            return;
        } else {
            if (this.currentAnswer.length >= 4) return;
            this.currentAnswer += val;
        }
        document.getElementById('quiz-answer-display').textContent = this.currentAnswer || '\u00A0';
    },

    submitAnswer() {
        const timeMs = this.practiceMode ? 0 : (Date.now() - this.questionStartTime);
        const userAnswer = parseInt(this.currentAnswer, 10);
        const correct = userAnswer === this.currentQuestion.answer;

        this.streak = correct ? this.streak + 1 : 0;

        const assessment = AdaptiveEngine.assessAnswer(
            this.currentPlayer.id, this.currentQuestion.strategyId, correct, timeMs
        );

        // Flag incorrect questions for future retry
        if (!correct) {
            Storage.flagQuestion(this.currentPlayer.id, {
                questionText: this.currentQuestion.questionText,
                correctAnswer: this.currentQuestion.answer,
                userAnswer,
                strategyId: this.currentQuestion.strategyId,
            });
        } else {
            // Unflag if answered correctly (retry success)
            Storage.unflagQuestion(this.currentPlayer.id, this.currentQuestion.questionText);
        }

        // Check for intervention trigger (2+ wrong in a row)
        const shouldIntervene = Intervention.recordAnswer(this.currentQuestion.strategyId, correct);

        // Log question
        Storage.logQuestion(this.currentPlayer.id, {
            sessionId: this.sessionId,
            strategyId: this.currentQuestion.strategyId,
            questionText: this.currentQuestion.questionText,
            correctAnswer: this.currentQuestion.answer,
            userAnswer, correct, timeMs,
            hintShown: this.hintShownForCurrent,
            assessment: assessment.assessment,
            masteryAfter: assessment.newMastery,
            levelAfter: assessment.newLevel,
            date: new Date().toISOString(),
        });

        // Update profile
        const profile = Storage.getProfile(this.currentPlayer.id);
        Storage.updateProfile(this.currentPlayer.id, {
            totalQuestions: (profile.totalQuestions || 0) + 1,
            totalCorrect: (profile.totalCorrect || 0) + (correct ? 1 : 0),
        });

        this.sessionResults.push({
            questionText: this.currentQuestion.questionText,
            correctAnswer: this.currentQuestion.answer,
            userAnswer, correct, timeMs,
            strategyId: this.currentQuestion.strategyId,
        });

        this.showFeedback(correct, assessment, shouldIntervene);
    },

    showFeedback(correct, assessment, shouldIntervene) {
        this.showingFeedback = true;
        const fb = document.getElementById('quiz-feedback');
        const answerEl = document.getElementById('quiz-answer-display');

        document.getElementById('quiz-streak').innerHTML = `&#x1f525; ${this.streak}`;
        fb.classList.remove('hidden', 'correct', 'incorrect');

        const mastery = assessment.newMastery || 0;
        const context = {
            correct,
            timeMs: Date.now() - this.questionStartTime,
            streak: this.streak,
            mastery,
        };

        if (correct) {
            fb.classList.add('correct');
            if (Settings.get('encouragingMessages', true)) {
                fb.textContent = Encouragement.getMessage(context);
            } else {
                let msg = pick(['Correct!', 'Well done!', 'Great job!', 'Yes!', 'Perfect!']);
                if (this.streak >= 5) msg += ` ${this.streak} in a row!`;
                fb.textContent = msg;
            }
            answerEl.classList.add('pulse-correct');
            setTimeout(() => answerEl.classList.remove('pulse-correct'), 600);
        } else {
            fb.classList.add('incorrect');
            fb.textContent = `The answer is ${this.currentQuestion.answer}`;
            answerEl.classList.add('shake');
            setTimeout(() => answerEl.classList.remove('shake'), 400);

            // Show teaching aids on wrong answer
            if (assessment.shouldShowHint && this.currentQuestion.hint) {
                const hintEl = document.getElementById('quiz-hint');
                hintEl.textContent = this.currentQuestion.hint;
                hintEl.classList.remove('hidden');
            }
            if (assessment.shouldShowVisual && this.currentQuestion.visual) {
                const visualEl = document.getElementById('quiz-visual');
                visualEl.innerHTML = VisualRenderer.render(this.currentQuestion.visual);
                visualEl.classList.remove('hidden');
                visualEl.classList.add('quiz-visual-large');
                VisualRenderer.bindInteractions(visualEl);
            }
        }

        // Avatar reaction
        this.updateAvatar(Encouragement.getMood(context));

        // Show encouragement below feedback on wrong answers
        const enc = document.getElementById('quiz-encouragement');
        if (enc && !correct && Settings.get('encouragingMessages', true)) {
            enc.textContent = Encouragement.getMessage(context);
            enc.classList.add('visible');
        }

        // Check for intervention (2+ wrong in a row on same strategy)
        if (shouldIntervene && !correct) {
            setTimeout(() => {
                Intervention.show(
                    this.currentQuestion.strategyId,
                    (stratId) => this.startPracticeMode(stratId),
                    () => { this.sessionIndex++; this.nextQuestion(); }
                );
            }, 1500);
            return;
        }

        setTimeout(() => { this.sessionIndex++; this.nextQuestion(); }, correct ? 1000 : 2500);
    },

    updateAvatar(mood) {
        const avatarEl = document.getElementById('quiz-avatar');
        if (!avatarEl) return;
        if (!Settings.get('showAvatar', true)) {
            avatarEl.classList.add('hidden');
            return;
        }
        avatarEl.classList.remove('hidden');
        avatarEl.innerHTML = Encouragement.renderAvatar(mood, 44);
        if (mood === 'excited' || mood === 'happy') {
            avatarEl.classList.add('bounce');
            setTimeout(() => avatarEl.classList.remove('bounce'), 500);
        }
    },

    quitQuiz() { this.endSession(); },

    endSession() {
        const totalCorrect = this.sessionResults.filter(r => r.correct).length;
        const totalAnswered = this.sessionResults.length;
        const avgTimeMs = totalAnswered > 0
            ? Math.round(this.sessionResults.reduce((s, r) => s + r.timeMs, 0) / totalAnswered)
            : 0;

        if (this.sessionId) {
            Storage.updateSession(this.currentPlayer.id, this.sessionId, {
                completed: true,
                endTime: new Date().toISOString(),
                totalCorrect,
                totalAnswered,
                avgTimeMs,
            });
        }

        const profile = Storage.getProfile(this.currentPlayer.id);
        Storage.updateProfile(this.currentPlayer.id, {
            totalSessions: (profile.totalSessions || 0) + 1,
        });

        // Check goals progress
        Goals.checkProgress(this.currentPlayer.id);

        // Daily challenge completion
        if (this.isDailyChallenge) {
            DailyChallenge.saveResult(this.currentPlayer.id, {
                correct: totalCorrect,
                total: totalAnswered,
                avgTime: totalAnswered > 0 ? (avgTimeMs / 1000).toFixed(1) : '0',
            });
            DailyChallenge.recordCompletion(this.currentPlayer.id);
        }

        this.practiceMode = false;
        this.isDailyChallenge = false;
        this.renderSummary();
        this.showScreen('screen-summary');
    },

    // ----- Summary -----

    renderSummary() {
        const results = this.sessionResults;
        const correct = results.filter(r => r.correct).length;
        const total = results.length;
        const avgTime = total > 0
            ? (Math.round(results.reduce((s, r) => s + r.timeMs, 0) / total / 100) / 10)
            : 0;
        const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

        document.getElementById('summary-title').textContent =
            pct >= 90 ? 'Amazing!' : pct >= 70 ? 'Great Work!' : pct >= 50 ? 'Good Effort!' : 'Keep Practising!';

        document.getElementById('summary-stats').innerHTML = `
            <div class="stat-box"><div class="stat-value">${correct}/${total}</div><div class="stat-label">Correct</div></div>
            <div class="stat-box"><div class="stat-value">${pct}%</div><div class="stat-label">Score</div></div>
            <div class="stat-box"><div class="stat-value">${avgTime}s</div><div class="stat-label">Avg Time</div></div>
        `;

        document.getElementById('summary-detail').innerHTML = results.map(r => `
            <div class="summary-row">
                <span class="q-text">${r.questionText}</span>
                <span class="q-result ${r.correct ? 'correct' : 'incorrect'}">
                    ${r.correct ? r.userAnswer : `${r.userAnswer} (${r.correctAnswer})`}
                </span>
            </div>
        `).join('');
    },

    // ----- Stats -----

    showStats() {
        const pid = this.currentPlayer.id;
        const container = document.getElementById('stats-content');

        let html = '<div class="stats-tabs">';
        html += '<button class="stats-tab active" data-tab="dashboard">Dashboard</button>';
        html += '<button class="stats-tab" data-tab="goals">Goals</button>';
        html += '</div>';
        html += '<div id="stats-tab-content"></div>';

        container.innerHTML = html;

        // Tab switching
        container.querySelectorAll('.stats-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderStatsTab(tab.dataset.tab, pid);
            });
        });

        this.renderStatsTab('dashboard', pid);
        this.showScreen('screen-stats');
    },

    renderStatsTab(tab, playerId) {
        const content = document.getElementById('stats-tab-content');
        if (tab === 'dashboard') {
            content.innerHTML = StatsDashboard.render(playerId);
            StatsDashboard.bindEvents(content, playerId);
        } else if (tab === 'goals') {
            let html = Goals.renderGoalForm(playerId);
            html += Goals.renderGoals(playerId);
            html += Goals.renderCompleted(playerId);
            content.innerHTML = html;
            this.bindGoalForm(playerId, content);
        }
    },

    // ----- Export -----

    toggleExportMenu() {
        if (this.exportMenuOpen) {
            this.closeExportMenu();
            return;
        }
        const menu = document.createElement('div');
        menu.className = 'export-menu';
        menu.id = 'export-menu';
        menu.innerHTML = `
            <button class="export-menu-item" id="export-json">Export JSON</button>
            <button class="export-menu-item" id="export-csv">Export CSV</button>
            <button class="export-menu-item" id="export-pdf">Export PDF Report</button>
        `;
        document.getElementById('screen-stats').appendChild(menu);
        this.exportMenuOpen = true;

        document.getElementById('export-json').addEventListener('click', () => { this.exportJSON(); this.closeExportMenu(); });
        document.getElementById('export-csv').addEventListener('click', () => { ExportUtils.exportCSV(this.currentPlayer.id, this.currentPlayer.name); this.closeExportMenu(); });
        document.getElementById('export-pdf').addEventListener('click', () => { ExportUtils.exportPDF(this.currentPlayer.id, this.currentPlayer.name); this.closeExportMenu(); });
    },

    closeExportMenu() {
        const menu = document.getElementById('export-menu');
        if (menu) menu.remove();
        this.exportMenuOpen = false;
    },

    exportJSON() {
        if (!this.currentPlayer) return;
        const data = Storage.exportAll(this.currentPlayer.id);
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mental-maths-${this.currentPlayer.name}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ----- Settings -----

    showSettings() {
        const container = document.getElementById('settings-content');
        container.innerHTML = Settings.renderSettings();
        Settings.bindSettingsEvents(container);
        this.showScreen('screen-settings');
    },

    // ----- Goals -----

    showGoals() {
        const pid = this.currentPlayer.id;
        const container = document.getElementById('goals-content');
        let html = Goals.renderGoalForm(pid);
        html += Goals.renderGoals(pid);
        html += Goals.renderCompleted(pid);
        container.innerHTML = html;
        this.bindGoalForm(pid, container);
        this.showScreen('screen-goals');
    },

    bindGoalForm(playerId, container) {
        const saveBtn = container.querySelector('#btn-save-goal');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const strategyId = container.querySelector('#goal-strategy').value;
                const targetMastery = parseInt(container.querySelector('#goal-target').value, 10);
                const deadline = container.querySelector('#goal-deadline').value || null;
                const description = container.querySelector('#goal-description').value || null;

                Goals.add(playerId, { strategyId, targetMastery, deadline, description });

                if (document.getElementById('screen-goals').classList.contains('active')) {
                    this.showGoals();
                } else {
                    this.renderStatsTab('goals', playerId);
                }
            });
        }

        container.querySelectorAll('.btn-goal-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                Goals.remove(playerId, btn.dataset.goalId);
                if (document.getElementById('screen-goals').classList.contains('active')) {
                    this.showGoals();
                } else {
                    this.renderStatsTab('goals', playerId);
                }
            });
        });
    },

    // ----- Teacher Dashboard -----

    openTeacherDashboard() {
        if (Settings.hasTeacherPIN()) {
            this.showPINDialog(() => this.renderTeacherDashboard());
        } else {
            this.renderTeacherDashboard();
        }
    },

    showPINDialog(onSuccess) {
        const overlay = document.createElement('div');
        overlay.className = 'pin-overlay';
        overlay.id = 'pin-overlay';
        overlay.innerHTML = `
            <div class="pin-dialog">
                <h3>Enter PIN</h3>
                <input type="password" id="pin-input" maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off">
                <div class="pin-error" id="pin-error">Incorrect PIN. Try again.</div>
                <div style="display:flex;gap:8px;">
                    <button class="btn" id="btn-pin-cancel" style="flex:1;">Cancel</button>
                    <button class="btn btn-primary" id="btn-pin-submit" style="flex:1;">Enter</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = document.getElementById('pin-input');
        input.focus();

        document.getElementById('btn-pin-cancel').addEventListener('click', () => overlay.remove());
        document.getElementById('btn-pin-submit').addEventListener('click', () => {
            if (Settings.verifyPIN(input.value)) {
                overlay.remove();
                onSuccess();
            } else {
                document.getElementById('pin-error').style.display = 'block';
                input.value = '';
                input.focus();
            }
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') document.getElementById('btn-pin-submit').click();
        });
    },

    renderTeacherDashboard() {
        const container = document.getElementById('teacher-content');
        container.innerHTML = TeacherDashboard.render();
        TeacherDashboard.bindEvents(container);
        this.showScreen('screen-teacher');
    },

    // ----- Version History -----

    showVersions() {
        const container = document.getElementById('versions-content');
        let html = '';
        VERSION_HISTORY.forEach(v => {
            html += `
            <div class="version-entry${v.current ? ' current' : ''}">
                <div class="version-entry-header">
                    <div>
                        <span class="version-number">v${v.version}</span>
                        ${v.current ? '<span class="version-badge">Current</span>' : ''}
                    </div>
                    <span class="version-date">${v.date}</span>
                </div>
                <div class="version-title">${v.title}</div>
                <ul class="version-changes">
                    ${v.changes.map(c => `<li>${c}</li>`).join('')}
                </ul>
                ${!v.current ? `<span class="version-archive-link" onclick="window.open('versions/${v.version}/index.html','_blank')">Open archived v${v.version}</span>` : ''}
            </div>`;
        });
        container.innerHTML = html;
        this.showScreen('screen-versions');
    },
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());

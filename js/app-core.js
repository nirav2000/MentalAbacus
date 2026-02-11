/* app-core.js - Core App: state, init, navigation, events, players, home */

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
};

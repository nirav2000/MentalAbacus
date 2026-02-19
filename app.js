(() => {
  'use strict';

  // ---------- Utility ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  // ---------- Storage Module ----------
  const Storage = (() => {
    const KEY = 'soroban_trainer_progress_v1';
    const base = {
      streak: 0,
      bestStreak: 0,
      lastCompletionDate: null,
      dailyCompletion: {},
      sessions: []
    };

    function load() {
      try {
        const data = JSON.parse(localStorage.getItem(KEY));
        return data ? { ...base, ...data } : { ...base };
      } catch {
        return { ...base };
      }
    }

    function save(data) {
      localStorage.setItem(KEY, JSON.stringify(data));
    }

    return { load, save };
  })();

  // ---------- Abacus Engine ----------
  const AbacusEngine = (() => {
    const COLS = 6;
    const MAX = 10 ** COLS - 1;

    // Each column stores a digit 0-9. UI derives bead states from the digit.
    const state = { digits: Array(COLS).fill(0) };

    function columnToDigit(col) {
      return state.digits[col];
    }

    function setColumnDigit(col, digit) {
      state.digits[col] = clamp(digit, 0, 9);
    }

    function digitToBeads(digit) {
      return {
        upperActive: digit >= 5,
        lowerActiveCount: digit % 5
      };
    }

    function getNumber() {
      return state.digits.reduce((sum, digit, col) => sum + digit * 10 ** col, 0);
    }

    function setNumber(n) {
      let safe = clamp(Math.floor(Number(n) || 0), 0, MAX);
      for (let i = 0; i < COLS; i++) {
        setColumnDigit(i, safe % 10);
        safe = Math.floor(safe / 10);
      }
      return getNumber();
    }

    function clear() {
      state.digits.fill(0);
      return 0;
    }

    // Carry/borrow naturally handled by whole-number arithmetic + re-decompose by digits.
    function applyDelta(delta) {
      const next = clamp(getNumber() + Math.floor(Number(delta) || 0), 0, MAX);
      return setNumber(next);
    }

    // Click interactions must keep valid soroban states.
    function toggleUpper(col) {
      const d = columnToDigit(col);
      const lower = d % 5;
      const upper = d >= 5 ? 0 : 1;
      setColumnDigit(col, upper * 5 + lower);
    }

    function toggleLower(col, beadIndex) {
      const d = columnToDigit(col);
      const upper = d >= 5 ? 1 : 0;
      const lower = d % 5;
      // Lower beads are contiguous from beam; clicking i sets count to i+1 if inactive, else i.
      const target = beadIndex + 1;
      const nextLower = lower >= target ? target - 1 : target;
      setColumnDigit(col, upper * 5 + nextLower);
    }

    function getColumns() {
      return state.digits.map(digitToBeads);
    }

    return {
      COLS,
      MAX,
      getNumber,
      setNumber,
      clear,
      applyDelta,
      toggleUpper,
      toggleLower,
      getColumns
    };
  })();

  // ---------- Drill & Curriculum Module ----------
  const Curriculum = (() => {
    const topics = [
      'plus1_2', 'plus5', 'make10', 'carry', 'subtraction', 'borrow', 'mixed'
    ];

    function generateDailyTasks(days = 14) {
      return Array.from({ length: days }, (_, i) => {
        const day = i + 1;
        const topic = topics[i % topics.length];
        return {
          day,
          lesson: `Day ${day}: Focus on ${topic.replace('_', ' ')} and maintain smooth finger logic mentally.`,
          drills: [
            { type: topic, count: 8 + (day % 4) * 2 },
            { type: 'mixed', count: 6 + (day % 3) * 2 }
          ]
        };
      });
    }

    function rand(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function makeProblem(type) {
      switch (type) {
        case 'plus1_2': {
          const a = rand(0, 80), b = rand(1, 2);
          return { a, op: '+', b, answer: a + b };
        }
        case 'plus5': {
          const a = rand(0, 90), b = 5;
          return { a, op: '+', b, answer: a + b };
        }
        case 'make10': {
          const a = rand(1, 9), b = 10 - a;
          return { a, op: '+', b, answer: a + b };
        }
        case 'carry': {
          const a = rand(8, 49), b = rand(2, 9);
          return { a, op: '+', b, answer: a + b };
        }
        case 'subtraction': {
          const a = rand(10, 99), b = rand(1, Math.min(9, a));
          return { a, op: '-', b, answer: a - b };
        }
        case 'borrow': {
          const a = rand(20, 99), b = rand(11, Math.min(19, a));
          return { a, op: '-', b, answer: a - b };
        }
        default: {
          const op = Math.random() > 0.45 ? '+' : '-';
          const a = rand(0, 120);
          const b = op === '+' ? rand(1, 25) : rand(1, Math.min(25, a));
          return { a, op, b, answer: op === '+' ? a + b : a - b };
        }
      }
    }

    function generateDrill(type, count = 10) {
      return Array.from({ length: count }, () => makeProblem(type));
    }

    return { generateDailyTasks, generateDrill };
  })();

  // ---------- App State ----------
  const App = (() => {
    const progress = Storage.load();
    const dailyTasks = Curriculum.generateDailyTasks(14);
    const programLessons = [
      { title: 'Lesson 1: Know the Beads', description: 'Understand upper bead = 5 and lower beads = 1. Build numbers 0-9 on one rod.', drills: ['Touch upper bead for +5', 'Use lower beads for +1..+4', 'Read bead state as a digit'], drillType: 'plus1_2', count: 5 },
      { title: 'Lesson 2: +1 and +2 fluency', description: 'Train quick small additions without hesitation.', drills: ['Practice +1 and +2 on random starts', 'Say the result before checking', 'Keep rhythm and consistency'], drillType: 'plus1_2', count: 8 },
      { title: 'Lesson 3: Understanding +5', description: 'Anchor five-bead moves as one chunk.', drills: ['Add +5 from multiple starts', 'Switch between +5 and +1/+2', 'Visualize top bead movement'], drillType: 'plus5', count: 8 },
      { title: 'Lesson 4: Make-10 complements', description: 'Use complements to make ten (1+9, 2+8, ...).', drills: ['Memorize complements to 10', 'Solve make-10 pairs quickly', 'Use complement language aloud'], drillType: 'make10', count: 8 },
      { title: 'Lesson 5: Carry in addition', description: 'Cross tens with confident carry logic.', drills: ['Add across 9s (e.g., 18+7)', 'Track units then tens carry', 'Avoid counting every bead'], drillType: 'carry', count: 8 },
      { title: 'Lesson 6: Simple subtraction', description: 'Subtract small values cleanly and steadily.', drills: ['Subtract 1-9 safely', 'Read remaining value each step', 'Keep finger/eye coordination'], drillType: 'subtraction', count: 8 },
      { title: 'Lesson 7: Borrow in subtraction', description: 'Borrow from next place without confusion.', drills: ['Practice 20-11 style problems', 'Say borrow step explicitly', 'Finish with calm pacing'], drillType: 'borrow', count: 8 },
      { title: 'Lesson 8: Mixed operations', description: 'Blend all core patterns in short sets.', drills: ['Alternate add/subtract', 'Protect accuracy under speed', 'Recover quickly after mistakes'], drillType: 'mixed', count: 10 }
    ];

    const uiState = {
      currentTab: 'trainer',
      currentMode: 'program',
      stepQueue: [],
      stepTarget: null,
      quizCurrent: null,
      flashSeq: [],
      flashTotal: 0,
      flashRunning: false,
      flashStartedAt: null,
      programLesson: 0,
      programQueue: [],
      programScore: { correct: 0, total: 0 },
      programStartedAt: null,
      dailyQueue: [],
      dailyStartedAt: null,
      dailyScore: { correct: 0, total: 0 }
    };

    progress.program = progress.program || { currentLesson: 0, completed: {} };
    uiState.programLesson = clamp(progress.program.currentLesson || 0, 0, programLessons.length - 1);

    function saveSession(session) {
      progress.sessions.unshift(session);
      progress.sessions = progress.sessions.slice(0, 50);
      Storage.save(progress);
      renderStats();
    }

    function updateStreak() {
      const today = new Date().toISOString().slice(0, 10);
      if (progress.lastCompletionDate === today) return;

      const prev = progress.lastCompletionDate ? new Date(progress.lastCompletionDate) : null;
      const t = new Date(today);
      const diffDays = prev ? Math.round((t - prev) / (1000 * 60 * 60 * 24)) : null;

      progress.streak = diffDays === 1 || progress.streak === 0 ? progress.streak + 1 : 1;
      progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
      progress.lastCompletionDate = today;
      Storage.save(progress);
    }

    // ---------- Rendering ----------
    function renderAbacus() {
      const board = $('#abacus-board');
      const cols = AbacusEngine.getColumns();

      board.innerHTML = cols.map((col, i) => {
        const place = 10 ** (AbacusEngine.COLS - i - 1);
        const colIndex = AbacusEngine.COLS - i - 1; // UI left->right, state right->left
        const lowerButtons = [0, 1, 2, 3].map((k) => {
          const active = k < col.lowerActiveCount;
          return `<button class="bead ${active ? 'active' : ''}" data-kind="lower" data-col="${colIndex}" data-index="${k}" aria-label="Lower bead ${k + 1}"></button>`;
        }).join('');

        return `
          <div class="column">
            <div class="col-label">${place}</div>
            <div class="rod">
              <button class="bead ${col.upperActive ? 'active' : ''}" data-kind="upper" data-col="${colIndex}" aria-label="Upper bead"></button>
              <div class="beam"></div>
              ${lowerButtons}
            </div>
          </div>`;
      }).join('');

      $('#abacus-value').textContent = String(AbacusEngine.getNumber());
    }

    function renderDaily() {
      const day = (new Date().getDate() - 1) % dailyTasks.length;
      const task = dailyTasks[day];
      $('#daily-lesson').textContent = task.lesson;
      $('#daily-drills').innerHTML = task.drills
        .map((d) => `<li>${d.type} × ${d.count}</li>`)
        .join('');
      $('#daily-start').dataset.day = task.day;
    }

    function renderStats() {
      const sessions = progress.sessions.slice(0, 10);
      const overallAccuracy = sessions.length
        ? (sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length).toFixed(1)
        : '0.0';

      $('#stats-overview').innerHTML = `
        <p><strong>Current streak:</strong> ${progress.streak} day(s)</p>
        <p><strong>Best streak:</strong> ${progress.bestStreak} day(s)</p>
        <p><strong>Recent average accuracy:</strong> ${overallAccuracy}%</p>
      `;

      $('#stats-history').innerHTML = sessions.map((s) => `
        <tr>
          <td>${s.date}</td>
          <td>${s.type}</td>
          <td>${s.score}</td>
          <td>${s.accuracy.toFixed(1)}%</td>
          <td>${s.avgTime.toFixed(2)}</td>
        </tr>
      `).join('');
    }

    function openAbacusTab() {
      document.querySelector('.tab-btn[data-tab="abacus"]')?.click();
    }

    function readAbacusAnswer() {
      return AbacusEngine.getNumber();
    }

    // ---------- Trainer Mode Logic ----------
    function renderProgramLesson() {
      const lesson = programLessons[uiState.programLesson];
      if (!lesson) return;

      $('#program-title').textContent = lesson.title;
      $('#program-description').textContent = lesson.description;
      $('#program-checklist').innerHTML = lesson.drills.map((item) => `<li>${item}</li>`).join('');
      const completedCount = Object.values(progress.program.completed).filter(Boolean).length;
      $('#program-progress').textContent = `Progress: ${completedCount}/${programLessons.length} lessons completed.`;
      $('#program-problem').textContent = 'Press “Start Lesson”.';
      $('#program-feedback').textContent = '';
      $('#program-feedback').className = 'result';
      $('#program-next-lesson').disabled = uiState.programLesson >= programLessons.length - 1;
    }

    function initProgramMode() {
      $('#program-start').addEventListener('click', () => {
        const lesson = programLessons[uiState.programLesson];
        uiState.programQueue = Curriculum.generateDrill(lesson.drillType, lesson.count);
        uiState.programScore = { correct: 0, total: 0 };
        uiState.programStartedAt = performance.now();
        const first = uiState.programQueue[0];
        if (first) {
          AbacusEngine.setNumber(first.a);
          renderAbacus();
        }
        $('#program-problem').textContent = first ? `${first.a} ${first.op} ${first.b} = ? (start value loaded on abacus)` : 'No problems for this lesson.';
        $('#program-feedback').textContent = 'Lesson started. Use the abacus to solve, then press “Check Abacus Value”.';
        $('#program-feedback').className = 'result';
        openAbacusTab();
      });

      $('#program-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const current = uiState.programQueue[0];
        if (!current) return;

        const userAnswer = readAbacusAnswer();
        const isCorrect = userAnswer === current.answer;
        uiState.programScore.total += 1;
        if (isCorrect) uiState.programScore.correct += 1;

        uiState.programQueue.shift();

        if (uiState.programQueue.length) {
          const next = uiState.programQueue[0];
          AbacusEngine.setNumber(next.a);
          renderAbacus();
          $('#program-problem').textContent = `${next.a} ${next.op} ${next.b} = ? (start value loaded on abacus)`;
          $('#program-feedback').className = `result ${isCorrect ? 'good' : 'bad'}`;
          $('#program-feedback').textContent = isCorrect
            ? 'Correct. Next start value is loaded on the abacus.'
            : `Not quite. Expected ${current.answer}. Next start value loaded.`;
          openAbacusTab();
          return;
        }

        const accuracy = uiState.programScore.total
          ? (uiState.programScore.correct / uiState.programScore.total) * 100
          : 0;
        const avgTime = uiState.programScore.total
          ? (performance.now() - uiState.programStartedAt) / 1000 / uiState.programScore.total
          : 0;

        const lessonNumber = uiState.programLesson + 1;
        const passed = accuracy >= 70;
        $('#program-problem').textContent = 'Lesson complete!';
        $('#program-feedback').className = `result ${passed ? 'good' : 'bad'}`;
        $('#program-feedback').textContent = passed
          ? `Great work: ${uiState.programScore.correct}/${uiState.programScore.total} (${accuracy.toFixed(1)}%). Lesson unlocked.`
          : `Score: ${uiState.programScore.correct}/${uiState.programScore.total} (${accuracy.toFixed(1)}%). Repeat lesson to reach 70%.`;

        if (passed) {
          progress.program.completed[uiState.programLesson] = true;
          progress.program.currentLesson = Math.min(uiState.programLesson + 1, programLessons.length - 1);
          Storage.save(progress);
          $('#program-progress').textContent = `Progress: ${Object.values(progress.program.completed).filter(Boolean).length}/${programLessons.length} lessons completed.`;
          $('#program-next-lesson').disabled = false;
        }

        saveSession({
          date: new Date().toLocaleDateString(),
          type: `Program L${lessonNumber}`,
          score: `${uiState.programScore.correct}/${uiState.programScore.total}`,
          accuracy,
          avgTime
        });
      });

      $('#program-next-lesson').addEventListener('click', () => {
        const isCurrentComplete = Boolean(progress.program.completed[uiState.programLesson]);
        if (!isCurrentComplete && uiState.programLesson < programLessons.length - 1) {
          $('#program-feedback').className = 'result bad';
          $('#program-feedback').textContent = 'Finish this lesson with 70%+ to unlock the next one.';
          return;
        }

        uiState.programLesson = Math.min(uiState.programLesson + 1, programLessons.length - 1);
        progress.program.currentLesson = uiState.programLesson;
        Storage.save(progress);
        renderProgramLesson();
      });

      renderProgramLesson();
    }

    function decomposeForStep(sign, value) {
      const val = Math.floor(Math.abs(value));
      const steps = [];
      const fives = Math.floor(val / 5);
      const ones = val % 5;
      for (let i = 0; i < fives; i++) steps.push(`${sign}5`);
      if (ones) steps.push(`${sign}${ones}`);
      return steps;
    }

    function initStepMode() {
      $('#step-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const start = Number($('#step-start').value || 0);
        const op = $('#step-op').value;
        const value = Number($('#step-value').value || 0);

        AbacusEngine.setNumber(start);
        const sign = op === '-' ? '-' : '+';
        uiState.stepQueue = decomposeForStep(sign, value);
        uiState.stepTarget = sign === '+' ? start + value : Math.max(0, start - value);

        $('#step-output').textContent = `Plan: ${uiState.stepQueue.join(' → ') || 'No-op'}`;
        $('#step-next').disabled = uiState.stepQueue.length === 0;
        renderAbacus();
      });

      $('#step-next').addEventListener('click', () => {
        const token = uiState.stepQueue.shift();
        if (!token) return;
        AbacusEngine.applyDelta(Number(token));
        renderAbacus();
        $('#step-output').textContent = uiState.stepQueue.length
          ? `Remaining: ${uiState.stepQueue.join(' → ')}`
          : `Done. Expected ${uiState.stepTarget}, current ${AbacusEngine.getNumber()}.`;
        $('#step-next').disabled = uiState.stepQueue.length === 0;
      });

      $('#step-reset').addEventListener('click', () => {
        uiState.stepQueue = [];
        AbacusEngine.clear();
        $('#step-output').textContent = 'Reset.';
        $('#step-next').disabled = true;
        renderAbacus();
      });
    }

    function initQuizMode() {
        $('#quiz-new').addEventListener('click', () => {
        const terms = Array.from({ length: 4 }, () => {
          const sign = Math.random() > 0.35 ? '+' : '-';
          const val = Math.floor(Math.random() * 15) + 1;
          return `${sign}${val}`;
        });

        const total = terms.reduce((sum, t) => sum + Number(t), 0);
        uiState.quizCurrent = { expr: terms.join(' '), answer: total, startedAt: performance.now() };
        $('#quiz-problem').textContent = `0 ${uiState.quizCurrent.expr}`;
        $('#quiz-feedback').textContent = '';
        AbacusEngine.clear();
        renderAbacus();
        openAbacusTab();
      });

      $('#quiz-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!uiState.quizCurrent) return;
        const user = readAbacusAnswer();
        const ok = user === uiState.quizCurrent.answer;
        const timeSec = (performance.now() - uiState.quizCurrent.startedAt) / 1000;

        const feedback = $('#quiz-feedback');
        feedback.className = `result ${ok ? 'good' : 'bad'}`;
        feedback.textContent = ok
          ? `Correct! ${uiState.quizCurrent.answer}`
          : `Not yet. Correct answer: ${uiState.quizCurrent.answer}`;

        saveSession({
          date: new Date().toLocaleDateString(),
          type: 'Quiz',
          score: ok ? '1/1' : '0/1',
          accuracy: ok ? 100 : 0,
          avgTime: timeSec
        });
      });
    }

    function initFlashMode() {
      $('#flash-start').addEventListener('click', async () => {
        if (uiState.flashRunning) return;
        const len = clamp(Number($('#flash-length').value || 6), 3, 15);
        const interval = clamp(Number($('#flash-interval').value || 900), 300, 3000);
        uiState.flashSeq = Array.from({ length: len }, () => Math.floor(Math.random() * 19) - 9);
        uiState.flashTotal = uiState.flashSeq.reduce((a, n) => a + n, 0);
        uiState.flashStartedAt = performance.now();
        uiState.flashRunning = true;
        $('#flash-feedback').textContent = '';
        $('#flash-answer-form').classList.add('hidden');
        AbacusEngine.clear();
        renderAbacus();

        for (const n of uiState.flashSeq) {
          $('#flash-display').textContent = n >= 0 ? `+${n}` : `${n}`;
          await new Promise((r) => setTimeout(r, interval));
          $('#flash-display').textContent = '•';
          await new Promise((r) => setTimeout(r, 150));
        }

        $('#flash-display').textContent = 'Enter final total';
        $('#flash-answer-form').classList.remove('hidden');
        openAbacusTab();
        uiState.flashRunning = false;
      });

      $('#flash-answer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = readAbacusAnswer();
        const ok = user === uiState.flashTotal;
        const feedback = $('#flash-feedback');
        feedback.className = `result ${ok ? 'good' : 'bad'}`;
        feedback.textContent = ok ? 'Great cadence accuracy!' : `Expected ${uiState.flashTotal}.`;

        saveSession({
          date: new Date().toLocaleDateString(),
          type: 'Flash',
          score: ok ? '1/1' : '0/1',
          accuracy: ok ? 100 : 0,
          avgTime: uiState.flashStartedAt ? (performance.now() - uiState.flashStartedAt) / 1000 : 0
        });
      });
    }

    function flattenDailyProblems(task) {
      return task.drills.flatMap((drill) => Curriculum.generateDrill(drill.type, drill.count));
    }

    function renderDailyProblem() {
      const current = uiState.dailyQueue[0];
      if (!current) {
        $('#daily-problem').textContent = 'Daily drill complete.';
        $('#daily-check').disabled = true;
        return;
      }

      AbacusEngine.setNumber(current.a);
      renderAbacus();
      $('#daily-problem').textContent = `${current.a} ${current.op} ${current.b} = ? (start value loaded on abacus)`;
      $('#daily-check').disabled = false;
      openAbacusTab();
    }

    function initDaily() {
      $('#daily-start').addEventListener('click', () => {
        const dayNum = Number($('#daily-start').dataset.day);
        const task = dailyTasks.find((d) => d.day === dayNum);
        if (!task) return;

        uiState.dailyQueue = flattenDailyProblems(task);
        uiState.dailyScore = { correct: 0, total: 0 };
        uiState.dailyStartedAt = performance.now();
        $('#daily-results').textContent = 'Daily drill started. Use the abacus for each answer.';
        $('#daily-results').className = 'result';
        renderDailyProblem();
      });

      $('#daily-check').addEventListener('click', () => {
        const current = uiState.dailyQueue[0];
        if (!current) return;

        const answer = readAbacusAnswer();
        const isCorrect = answer === current.answer;
        uiState.dailyScore.total += 1;
        if (isCorrect) uiState.dailyScore.correct += 1;
        uiState.dailyQueue.shift();

        if (uiState.dailyQueue.length) {
          $('#daily-results').className = `result ${isCorrect ? 'good' : 'bad'}`;
          $('#daily-results').textContent = isCorrect
            ? 'Correct. Next problem loaded on abacus.'
            : `Incorrect. Correct answer was ${current.answer}. Next loaded.`;
          renderDailyProblem();
          return;
        }

        const accuracy = uiState.dailyScore.total ? (uiState.dailyScore.correct / uiState.dailyScore.total) * 100 : 0;
        const avgTime = uiState.dailyScore.total
          ? (performance.now() - uiState.dailyStartedAt) / 1000 / uiState.dailyScore.total
          : 0;
        const dayNum = Number($('#daily-start').dataset.day);

        $('#daily-results').className = `result ${accuracy >= 70 ? 'good' : 'bad'}`;
        $('#daily-results').textContent = `Completed day ${dayNum}: ${uiState.dailyScore.correct}/${uiState.dailyScore.total} (${accuracy.toFixed(1)}%).`;
        $('#daily-problem').textContent = 'Daily drill complete.';
        $('#daily-check').disabled = true;

        progress.dailyCompletion[dayNum] = true;
        updateStreak();
        Storage.save(progress);

        saveSession({
          date: new Date().toLocaleDateString(),
          type: `Daily ${dayNum}`,
          score: `${uiState.dailyScore.correct}/${uiState.dailyScore.total}`,
          accuracy,
          avgTime
        });
      });
    }

    // ---------- Navigation / Input ----------
    function bindNav() {
      $$('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.currentTab = btn.dataset.tab;
          $$('.tab-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
          $$('.view').forEach((v) => v.classList.toggle('is-active', v.id === uiState.currentTab));
        });
      });

      $$('.mode-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          uiState.currentMode = btn.dataset.mode;
          $$('.mode-btn').forEach((b) => b.classList.toggle('is-active', b === btn));
          $$('.mode-panel').forEach((p) => p.classList.toggle('is-active', p.id === `${uiState.currentMode}-mode`));
        });
      });

      document.addEventListener('keydown', (e) => {
        if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          $$('.tab-btn')[idx]?.click();
        }
      });
    }

    function bindAbacusControls() {
      $('#abacus-board').addEventListener('click', (e) => {
        const t = e.target;
        if (!(t instanceof HTMLElement) || !t.classList.contains('bead')) return;
        const col = Number(t.dataset.col);
        if (t.dataset.kind === 'upper') AbacusEngine.toggleUpper(col);
        if (t.dataset.kind === 'lower') AbacusEngine.toggleLower(col, Number(t.dataset.index));
        renderAbacus();
      });

      $('#set-number-btn').addEventListener('click', () => {
        AbacusEngine.setNumber(Number($('#set-number-input').value));
        renderAbacus();
      });

      $('#apply-delta-btn').addEventListener('click', () => {
        AbacusEngine.applyDelta(Number($('#delta-input').value));
        renderAbacus();
      });

      $('#clear-abacus-btn').addEventListener('click', () => {
        AbacusEngine.clear();
        renderAbacus();
      });
    }

    function init() {
      bindNav();
      bindAbacusControls();
      initProgramMode();
      initStepMode();
      initQuizMode();
      initFlashMode();
      initDaily();
      renderDaily();
      renderAbacus();
      renderStats();

      // Expose helper tests in console.
      window.runAbacusTests = () => {
        const cases = [
          { start: 9, delta: 1, expected: 10 },
          { start: 100, delta: -1, expected: 99 },
          { start: 999999, delta: 1, expected: 999999 },
          { start: 0, delta: -5, expected: 0 },
          { start: 205, delta: -17, expected: 188 }
        ];

        const results = cases.map((c) => {
          AbacusEngine.setNumber(c.start);
          const got = AbacusEngine.applyDelta(c.delta);
          return { ...c, got, pass: got === c.expected };
        });
        console.table(results);
        return results;
      };

      window.SorobanAPI = {
        setNumber: AbacusEngine.setNumber,
        getNumber: AbacusEngine.getNumber,
        clear: AbacusEngine.clear,
        applyDelta: AbacusEngine.applyDelta
      };
    }

    return { init };
  })();

  document.addEventListener('DOMContentLoaded', App.init);
})();

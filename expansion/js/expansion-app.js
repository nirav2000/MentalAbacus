/**
 * Expansion App Entry Point
 * Main application router and screen management for the expansion module.
 */

import { COLOURS, PROGRESSION_LEVELS, METHOD_DEFINITIONS, ADDITION_STRATEGIES, SUBTRACTION_STRATEGIES } from './expansion-config.js';
import { loadExpansionData } from './data/expansion-storage.js';
import { startPractice as startAdditionPractice, getNextProblem as getNextAdditionProblem, submitAnswer as submitAdditionAnswer, endPractice as endAdditionPractice, getCurrentSession as getCurrentAdditionSession } from './facts/addition-practice.js';
import { startPractice as startSubtractionPractice, getNextProblem as getNextSubtractionProblem, submitAnswer as submitSubtractionAnswer, endPractice as endSubtractionPractice, getCurrentSession as getCurrentSubtractionSession } from './facts/subtraction-practice.js';
import { renderFactGrid } from './facts/fact-grid.js';
import { renderDiagnosticIntro, renderQuizScreen } from './diagnostics/diagnostic-ui.js';
import { createDiagnosticQuiz } from './diagnostics/diagnostic-quiz.js';
import { getActiveMisunderstandings, getRemediationPriority, getAllMisunderstandings } from './diagnostics/misunderstanding-tracker.js';
import { startRemediationUnit } from './diagnostics/remediation-ui.js';
import { NumberLineVisual } from './visuals/number-line.js';
import { TenFrameVisual } from './visuals/ten-frames.js';
import { Base10Visual } from './visuals/base10-blocks.js';
import { PartWholeVisual } from './visuals/part-whole-model.js';
import { getApplicableMethods } from './methods/method-selector.js';
import { renderMethodCards } from './methods/method-cards.js';
import { renderComparison } from './methods/method-comparison.js';
import { renderSteps } from './ui/step-display.js';
import { generateProblem, generateProblemSet } from './problems/problem-generator.js';
import { adjustDifficulty, selectNextProblem, shouldUnlockNextLevel, calculatePracticeSessionStats } from './problems/difficulty-engine.js';

// Current screen state
let currentScreen = 'home';
let expansionData = null;
let currentProblem = null;
let showingHint = false;
let currentOperation = 'addition'; // 'addition' or 'subtraction'
let methodsScreenState = {
  a: null,
  op: null,
  b: null,
  selectedMethod: null,
  currentStep: 0,
  solution: null,
  showingComparison: false
};

let levelsScreenState = {
  level: null,
  operation: null,
  difficulty: 'medium',
  currentProblem: null,
  problemSet: [],
  currentIndex: 0,
  sessionResults: [],
  startTime: null,
  selectedMethod: null
};

/**
 * Initializes the expansion app.
 */
function init() {
  expansionData = loadExpansionData();
  renderScreen('home');
}

/**
 * Renders a screen by name.
 * @param {string} screenName - Name of the screen to render
 * @param {Object} params - Optional parameters for the screen
 */
export function renderScreen(screenName, params = {}) {
  currentScreen = screenName;
  const root = document.getElementById('expansion-root');

  if (!root) {
    console.error('Expansion root element not found');
    return;
  }

  // Clear current content
  root.innerHTML = '';

  // Render the appropriate screen
  switch (screenName) {
    case 'home':
      renderHomeScreen(root);
      break;
    case 'addition-facts':
      renderAdditionFactsScreen(root, params);
      break;
    case 'subtraction-facts':
      renderSubtractionFactsScreen(root, params);
      break;
    case 'fact-grid':
      renderFactGridScreen(root, params);
      break;
    case 'levels':
      renderLevelsScreen(root);
      break;
    case 'methods':
      renderMethodsScreen(root);
      break;
    case 'diagnostics':
      renderDiagnosticsScreen(root, params);
      break;
    case 'remediation':
      renderRemediationScreen(root, params);
      break;
    case 'visual-demo':
      renderVisualDemoScreen(root);
      break;
    case 'progress':
      renderProgressScreen(root);
      break;
    default:
      renderNotFoundScreen(root);
  }
}

/**
 * Renders the home screen with cards linking to each section.
 * @param {HTMLElement} root - Root element to render into
 */
function renderHomeScreen(root) {
  const sections = [
    {
      id: 'addition-facts',
      title: 'Addition Facts',
      description: 'Master addition strategies and facts (0-12)',
      icon: '➕',
      status: 'unlocked'
    },
    {
      id: 'subtraction-facts',
      title: 'Subtraction Facts',
      description: 'Master subtraction strategies and facts',
      icon: '➖',
      status: 'unlocked'
    },
    {
      id: 'fact-grid',
      title: 'Fact Mastery Grid',
      description: 'Visual 13×13 grid showing all facts and mastery levels',
      icon: '📊',
      status: 'unlocked'
    },
    {
      id: 'levels',
      title: 'Progressive Levels',
      description: 'Apply skills to larger numbers (2-digit to 4-digit)',
      icon: '📈',
      status: 'unlocked'
    },
    {
      id: 'methods',
      title: 'Mental Math Methods',
      description: 'Learn different strategies for solving problems',
      icon: '🧠',
      status: 'unlocked'
    },
    {
      id: 'diagnostics',
      title: 'Diagnostics & Support',
      description: 'Identify and work on areas for improvement',
      icon: '🔍',
      status: 'unlocked'
    },
    {
      id: 'visual-demo',
      title: 'Visual Components Demo',
      description: 'Test number line and ten frame visualizations',
      icon: '🎨',
      status: 'unlocked'
    },
    {
      id: 'progress',
      title: 'Progress Dashboard',
      description: 'View your mastery and track your journey',
      icon: '📉',
      status: 'unlocked'
    }
  ];

  // Check for active misunderstandings
  const activeMisunderstandings = getActiveMisunderstandings();
  const highPriority = getRemediationPriority().slice(0, 3); // Top 3

  const container = document.createElement('div');
  container.innerHTML = `
    ${activeMisunderstandings.length > 0 ? `
      <div class="alert-banner misunderstanding-alert">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <h3>We've Noticed Some Patterns</h3>
          <p>We detected ${activeMisunderstandings.length} area${activeMisunderstandings.length > 1 ? 's' : ''} where focused practice could help:</p>
          <ul class="misunderstanding-list">
            ${highPriority.map(m => `
              <li>
                <strong>${m.name}</strong>
                <span class="severity-badge severity-${m.severity}">${m.severity === 3 ? 'High' : m.severity === 2 ? 'Medium' : 'Low'} Priority</span>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-primary" onclick="window.expansionApp.renderScreen('diagnostics')">Review & Practice</button>
        </div>
      </div>
    ` : ''}
    <div class="card">
      <h1>Mental Math Expansion</h1>
      <p>Welcome to the Addition & Subtraction mastery module. Choose a section to begin your learning journey.</p>
    </div>
    <div class="card-grid" id="section-cards"></div>
  `;

  root.appendChild(container);

  const grid = document.getElementById('section-cards');
  sections.forEach(section => {
    const card = createSectionCard(section);
    grid.appendChild(card);
  });
}

/**
 * Creates a section card element.
 * @param {Object} section - Section data
 * @returns {HTMLElement} Card element
 */
function createSectionCard(section) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.cursor = section.status === 'unlocked' ? 'pointer' : 'not-allowed';
  card.style.opacity = section.status === 'unlocked' ? '1' : '0.6';

  card.innerHTML = `
    <div style="font-size: 3rem; text-align: center; margin-bottom: 1rem;">
      ${section.icon}
    </div>
    <h2>${section.title}</h2>
    <p>${section.description}</p>
    ${section.status === 'locked' ? '<span class="status-badge status-locked">Locked</span>' : ''}
  `;

  if (section.status === 'unlocked') {
    card.addEventListener('click', () => renderScreen(section.id));
  }

  return card;
}

/**
 * Renders a coming soon screen for unimplemented sections.
 * @param {HTMLElement} root - Root element
 * @param {string} title - Screen title
 */
function renderComingSoon(root, title) {
  root.innerHTML = `
    <div class="coming-soon">
      <h2>${title}</h2>
      <p>This section is coming soon in future prompts!</p>
      <button class="btn btn-primary" onclick="window.expansionApp.renderScreen('home')">
        Back to Home
      </button>
    </div>
  `;
}

// Screen render functions
function renderAdditionFactsScreen(root, params = {}) {
  currentOperation = 'addition';
  const session = getCurrentAdditionSession();

  if (session) {
    renderPracticeScreen(root, 'addition');
  } else if (params.showSummary) {
    renderSummaryScreen(root, params.summary, 'addition');
  } else {
    renderStrategySelector(root, 'addition');
  }
}

function renderStrategySelector(root, operation = 'addition') {
  expansionData = loadExpansionData();
  const isAddition = operation === 'addition';
  const strategyGroups = isAddition ? expansionData.additionFacts.strategyGroups : expansionData.subtractionFacts.strategyGroups;
  const strategies = isAddition ? ADDITION_STRATEGIES : SUBTRACTION_STRATEGIES;
  const screenName = isAddition ? 'addition-facts' : 'subtraction-facts';
  const title = isAddition ? 'Addition Facts Practice' : 'Subtraction Facts Practice';

  // Count unlocked strategies
  const unlockedCount = Object.values(strategyGroups).filter(s => s.status === 'unlocked').length;

  const container = document.createElement('div');
  container.innerHTML = `
    <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
      <button class="btn btn-secondary" onclick="window.expansionApp.renderScreen('home')">
        ← Back to Home
      </button>
      <button class="btn btn-secondary" id="view-grid-btn">
        📊 View Mastery Grid
      </button>
    </div>
    <div class="card">
      <h1>${title}</h1>
      <p>Master ${operation} strategies by working through them in order. Each strategy builds on the previous ones.</p>
      ${unlockedCount >= 3 ? '<button class="btn btn-primary" id="mixed-practice-btn" style="margin-top: 1rem;">Start Mixed Practice (All Unlocked)</button>' : ''}
    </div>
    <div class="strategy-list" id="strategy-list"></div>
  `;

  root.appendChild(container);

  // Add event listener for grid view
  document.getElementById('view-grid-btn').addEventListener('click', () => {
    renderScreen('fact-grid', { operation });
  });

  // Add event listener for mixed practice
  if (unlockedCount >= 3) {
    document.getElementById('mixed-practice-btn').addEventListener('click', () => {
      if (isAddition) {
        startAdditionPractice('mixed', 20);
      } else {
        startSubtractionPractice('mixed', 20);
      }
      renderScreen(screenName);
    });
  }

  // Render strategy cards
  const strategyList = document.getElementById('strategy-list');
  strategies.forEach(strategy => {
    const groupData = strategyGroups[strategy.id] || { status: 'locked', percentComplete: 0 };
    const card = createStrategyCard(strategy, groupData, operation);
    strategyList.appendChild(card);
  });
}

function createStrategyCard(strategy, groupData, operation = 'addition') {
  const isUnlocked = groupData.status === 'unlocked' || strategy.teachingOrder === 1;
  const card = document.createElement('div');
  card.className = `strategy-card ${isUnlocked ? 'unlocked' : 'locked'}`;

  card.innerHTML = `
    <div class="strategy-info">
      <h3>${strategy.name}</h3>
      <p>${strategy.description}</p>
    </div>
    <div class="strategy-actions">
      ${isUnlocked ?
        `<button class="btn btn-primary btn-small" data-strategy="${strategy.id}">Practice</button>` :
        `<span class="strategy-status status-locked">Locked</span>`
      }
    </div>
  `;

  if (isUnlocked) {
    const btn = card.querySelector('button');
    const screenName = operation === 'addition' ? 'addition-facts' : 'subtraction-facts';
    btn.addEventListener('click', () => {
      if (operation === 'addition') {
        startAdditionPractice(strategy.id, 20);
      } else {
        startSubtractionPractice(strategy.id, 20);
      }
      renderScreen(screenName);
    });
  }

  return card;
}

function renderPracticeScreen(root, operation = 'addition') {
  const isAddition = operation === 'addition';
  const session = isAddition ? getCurrentAdditionSession() : getCurrentSubtractionSession();
  const screenName = isAddition ? 'addition-facts' : 'subtraction-facts';
  const operator = isAddition ? '+' : '−';

  if (!session) {
    renderStrategySelector(root, operation);
    return;
  }

  if (!currentProblem) {
    currentProblem = isAddition ? getNextAdditionProblem() : getNextSubtractionProblem();
  }

  if (!currentProblem) {
    // Session ended
    const summary = isAddition ? endAdditionPractice() : endSubtractionPractice();
    renderScreen(screenName, { showSummary: true, summary });
    return;
  }

  const container = document.createElement('div');
  container.className = 'practice-container';
  container.innerHTML = `
    <div class="practice-header">
      <span class="progress-indicator">Question ${session.currentIndex + 1} of ${session.totalProblems}</span>
      <button class="btn btn-secondary btn-small" id="quit-btn">Quit</button>
    </div>

    <div class="problem-display">
      <div class="problem-equation">
        <span>${currentProblem.a}</span>
        <span class="operator">${operator}</span>
        <span>${currentProblem.b}</span>
        <span class="operator">=</span>
        <span>?</span>
      </div>
    </div>

    <div class="answer-input-container">
      <input type="number" id="answer-input" class="answer-input" placeholder="?" autofocus />
    </div>

    <div class="practice-buttons">
      <button class="btn btn-submit" id="submit-btn">Submit Answer</button>
      <button class="btn btn-hint" id="hint-btn">Show Hint</button>
    </div>

    <div id="feedback-area"></div>
  `;

  root.appendChild(container);

  // Event listeners
  document.getElementById('submit-btn').addEventListener('click', () => handleSubmit(operation));
  document.getElementById('hint-btn').addEventListener('click', showHint);
  document.getElementById('quit-btn').addEventListener('click', () => {
    const summary = isAddition ? endAdditionPractice() : endSubtractionPractice();
    renderScreen(screenName, { showSummary: true, summary });
  });

  const input = document.getElementById('answer-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSubmit(operation);
    }
  });
}

function handleSubmit(operation = 'addition') {
  const input = document.getElementById('answer-input');
  const answer = input.value;

  if (!answer) return;

  const isAddition = operation === 'addition';
  const result = isAddition ? submitAdditionAnswer(answer) : submitSubtractionAnswer(answer);
  const screenName = isAddition ? 'addition-facts' : 'subtraction-facts';

  // Update input styling
  input.className = `answer-input ${result.correct ? 'correct' : 'incorrect'}`;
  input.disabled = true;

  // Show feedback
  const feedbackArea = document.getElementById('feedback-area');
  feedbackArea.innerHTML = `
    <div class="feedback ${result.correct ? 'correct' : 'incorrect'}">
      ${result.feedback}
      ${result.correct ? '' : ` You answered ${answer}.`}
      <br><br>
      <button class="btn btn-primary" id="next-btn">Next Problem</button>
    </div>
  `;

  document.getElementById('next-btn').addEventListener('click', () => {
    currentProblem = null;
    showingHint = false;
    renderScreen(screenName);
  });
}

function showHint() {
  if (showingHint) return;

  showingHint = true;
  const feedbackArea = document.getElementById('feedback-area');
  feedbackArea.innerHTML = `
    <div class="feedback hint">
      <strong>Hint:</strong> ${currentProblem.hint}
    </div>
  `;
}

function renderSummaryScreen(root, summary, operation = 'addition') {
  const accuracyPercent = Math.round(summary.accuracy * 100);
  const avgTimeSec = (summary.avgTime / 1000).toFixed(1);
  const screenName = operation === 'addition' ? 'addition-facts' : 'subtraction-facts';

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="session-summary">
      <h2 class="summary-title">Practice Complete!</h2>

      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-value">${summary.correct}/${summary.total}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${accuracyPercent}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${avgTimeSec}s</div>
          <div class="stat-label">Avg Time</div>
        </div>
      </div>

      <div class="summary-actions">
        <button class="btn btn-primary" id="practice-again-btn">Practice Again</button>
        <button class="btn btn-secondary" id="back-home-btn">Back to Home</button>
      </div>
    </div>
  `;

  root.appendChild(container);

  document.getElementById('practice-again-btn').addEventListener('click', () => {
    renderScreen(screenName);
  });

  document.getElementById('back-home-btn').addEventListener('click', () => {
    renderScreen('home');
  });
}

function renderSubtractionFactsScreen(root, params = {}) {
  currentOperation = 'subtraction';
  const session = getCurrentSubtractionSession();

  if (session) {
    renderPracticeScreen(root, 'subtraction');
  } else if (params.showSummary) {
    renderSummaryScreen(root, params.summary, 'subtraction');
  } else {
    renderStrategySelector(root, 'subtraction');
  }
}

function renderFactGridScreen(root, params = {}) {
  const operation = params.operation || 'addition';
  renderFactGrid(root, operation);

  // Add toggle button event listener after grid is rendered
  setTimeout(() => {
    const toggleBtn = document.getElementById('toggle-operation');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const newOperation = operation === 'addition' ? 'subtraction' : 'addition';
        renderScreen('fact-grid', { operation: newOperation });
      });
    }
  }, 100);
}

function renderLevelsScreen(root) {
  if (!levelsScreenState.level) {
    renderLevelSelection(root);
  } else if (levelsScreenState.currentProblem && levelsScreenState.currentIndex < levelsScreenState.problemSet.length) {
    renderPracticeProblem(root);
  } else if (levelsScreenState.sessionResults.length > 0) {
    renderPracticeResults(root);
  } else {
    renderLevelSelection(root);
  }
}

function renderLevelSelection(root) {
  const levels = [
    { num: 2, name: 'Two-digit ± Single-digit', examples: '34 + 7, 52 - 8', unlocked: true },
    { num: 3, name: 'Two-digit ± Two-digit', examples: '47 + 35, 82 - 46', unlocked: true },
    { num: 4, name: 'Three-digit Numbers', examples: '347 + 256, 503 - 187', unlocked: true },
    { num: 5, name: 'Four-digit and Beyond', examples: '4,372 + 1,859', unlocked: true }
  ];

  root.innerHTML = `
    <div class="card">
      <h1>Progressive Practice Levels 📈</h1>
      <p>Practice arithmetic with increasingly larger numbers. Choose a level to begin!</p>
    </div>
    <div class="card">
      <h2>Select a Level</h2>
      <div class="level-cards">
        ${levels.map(level => `
          <div class="level-card ${level.unlocked ? '' : 'locked'}" data-level="${level.num}">
            <div class="level-header">
              <div class="level-number">Level ${level.num}</div>
              ${level.unlocked ? '<span class="level-status unlocked">✓ Unlocked</span>' : '<span class="level-status locked">🔒 Locked</span>'}
            </div>
            <h3>${level.name}</h3>
            <p class="level-examples">${level.examples}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.level-card').forEach(card => {
    card.addEventListener('click', () => {
      const level = parseInt(card.dataset.level);
      showOperationChoice(root, level);
    });
  });
}

function showOperationChoice(root, level) {
  root.innerHTML = `
    <div class="card">
      <h2>Level ${level} Practice</h2>
      <p>Choose which operation to practice:</p>
      <div class="operation-choice">
        <button class="btn btn-large" data-op="+">
          <span class="op-icon">➕</span>
          <span class="op-name">Addition</span>
        </button>
        <button class="btn btn-large" data-op="-">
          <span class="op-icon">➖</span>
          <span class="op-name">Subtraction</span>
        </button>
        <button class="btn btn-large" data-op="mixed">
          <span class="op-icon">🔀</span>
          <span class="op-name">Mixed</span>
        </button>
      </div>
      <button class="btn btn-secondary" id="back-to-levels">← Back to Levels</button>
    </div>
  `;

  document.querySelectorAll('.operation-choice button[data-op]').forEach(btn => {
    btn.addEventListener('click', () => {
      const operation = btn.dataset.op;
      startPracticeSession(level, operation);
      renderScreen('levels');
    });
  });

  document.getElementById('back-to-levels').addEventListener('click', () => {
    levelsScreenState = { level: null, operation: null, difficulty: 'medium', currentProblem: null, problemSet: [], currentIndex: 0, sessionResults: [], startTime: null, selectedMethod: null };
    renderScreen('levels');
  });
}

function startPracticeSession(level, operation) {
  const difficulty = 'medium'; // Start at medium, will adapt
  const count = 10;
  const actualOp = operation === 'mixed' ? (Math.random() > 0.5 ? '+' : '-') : operation;
  const problemSet = generateProblemSet(level, actualOp, difficulty, count);

  levelsScreenState = {
    level,
    operation,
    difficulty,
    currentProblem: problemSet[0],
    problemSet,
    currentIndex: 0,
    sessionResults: [],
    startTime: Date.now(),
    selectedMethod: null
  };
}

function renderPracticeProblem(root) {
  const { level, currentProblem, currentIndex, problemSet, sessionResults } = levelsScreenState;
  const { a, operation, b, answer } = currentProblem;
  const progress = currentIndex + 1;
  const total = problemSet.length;

  root.innerHTML = `
    <div class="practice-header">
      <div class="practice-info">
        <span class="level-badge">Level ${level}</span>
        <span class="progress-badge">Problem ${progress} / ${total}</span>
      </div>
      <button class="btn btn-secondary btn-small" id="end-practice">End Practice</button>
    </div>
    <div class="card practice-card">
      <div class="problem-display">
        <div class="problem-equation">${a} ${operation} ${b} = ?</div>
      </div>
      <div class="answer-input-section">
        <input type="number" id="answer-input" class="answer-input" placeholder="Your answer" autofocus />
        <button class="btn btn-primary btn-large" id="submit-answer">Check Answer</button>
      </div>
      <div id="feedback-area" class="feedback-area"></div>
    </div>
    <div class="session-stats-mini">
      <div class="stat-item">
        <div class="stat-value">${sessionResults.filter(r => r.correct).length}</div>
        <div class="stat-label">Correct</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${sessionResults.filter(r => !r.correct).length}</div>
        <div class="stat-label">Incorrect</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${sessionResults.length > 0 ? Math.round((sessionResults.filter(r => r.correct).length / sessionResults.length) * 100) : 0}%</div>
        <div class="stat-label">Accuracy</div>
      </div>
    </div>
  `;

  const submitAnswer = () => {
    const userAnswer = parseInt(document.getElementById('answer-input').value);
    if (isNaN(userAnswer)) return;

    const correct = userAnswer === answer;
    const timeSeconds = (Date.now() - levelsScreenState.startTime) / 1000;

    levelsScreenState.sessionResults.push({
      problem: currentProblem,
      userAnswer,
      correct,
      timeSeconds: timeSeconds / (currentIndex + 1),
      timestamp: Date.now()
    });

    const feedbackArea = document.getElementById('feedback-area');
    if (correct) {
      feedbackArea.innerHTML = '<div class="feedback-correct"><span class="feedback-icon">✓</span><span class="feedback-text">Correct!</span></div>';
      feedbackArea.className = 'feedback-area feedback-correct-anim';
    } else {
      feedbackArea.innerHTML = `<div class="feedback-incorrect"><span class="feedback-icon">✗</span><span class="feedback-text">Not quite. The answer is ${answer}</span></div>`;
      feedbackArea.className = 'feedback-area feedback-incorrect-anim';
    }

    document.getElementById('submit-answer').textContent = 'Next Problem →';
    document.getElementById('submit-answer').onclick = () => {
      levelsScreenState.currentIndex++;
      if (levelsScreenState.currentIndex < levelsScreenState.problemSet.length) {
        levelsScreenState.currentProblem = levelsScreenState.problemSet[levelsScreenState.currentIndex];
        renderScreen('levels');
      } else {
        renderScreen('levels');
      }
    };
    document.getElementById('answer-input').disabled = true;
  };

  document.getElementById('submit-answer').addEventListener('click', submitAnswer);
  document.getElementById('answer-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
  });

  document.getElementById('end-practice').addEventListener('click', () => {
    if (sessionResults.length > 0) {
      renderScreen('levels');
    } else {
      levelsScreenState = { level: null, operation: null, difficulty: 'medium', currentProblem: null, problemSet: [], currentIndex: 0, sessionResults: [], startTime: null, selectedMethod: null };
      renderScreen('levels');
    }
  });

  setTimeout(() => document.getElementById('answer-input').focus(), 100);
}

function renderPracticeResults(root) {
  const { level, operation, sessionResults } = levelsScreenState;
  const stats = calculatePracticeSessionStats(sessionResults);
  const unlockNext = shouldUnlockNextLevel(sessionResults, level);

  root.innerHTML = `
    <div class="card results-card">
      <h1>Practice Complete! 🎉</h1>
      <div class="results-summary">
        <div class="result-stat-large">
          <div class="stat-value-large">${Math.round(stats.accuracy * 100)}%</div>
          <div class="stat-label-large">Accuracy</div>
        </div>
        <div class="results-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-icon">✓</span>
            <span class="breakdown-text">${stats.correct} Correct</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-icon">✗</span>
            <span class="breakdown-text">${stats.incorrect} Incorrect</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-icon">⏱</span>
            <span class="breakdown-text">${stats.avgTime.toFixed(1)}s average</span>
          </div>
        </div>
      </div>
      ${unlockNext ? `
        <div class="unlock-banner">
          <div class="unlock-icon">🎊</div>
          <div class="unlock-text">
            <strong>Level ${level + 1} Unlocked!</strong>
            <p>Great work! You're ready for the next challenge.</p>
          </div>
        </div>
      ` : stats.accuracy < 0.7 ? `
        <div class="encouragement-banner">
          <p>Keep practicing! You're building important skills.</p>
        </div>
      ` : ''}
      <div class="button-group">
        <button class="btn btn-primary" id="practice-again">Practice Again</button>
        <button class="btn btn-secondary" id="back-to-levels">Choose Different Level</button>
        <button class="btn btn-secondary" id="back-home">Back to Home</button>
      </div>
    </div>
  `;

  document.getElementById('practice-again').addEventListener('click', () => {
    startPracticeSession(level, operation);
    renderScreen('levels');
  });

  document.getElementById('back-to-levels').addEventListener('click', () => {
    levelsScreenState = { level: null, operation: null, difficulty: 'medium', currentProblem: null, problemSet: [], currentIndex: 0, sessionResults: [], startTime: null, selectedMethod: null };
    renderScreen('levels');
  });

  document.getElementById('back-home').addEventListener('click', () => {
    levelsScreenState = { level: null, operation: null, difficulty: 'medium', currentProblem: null, problemSet: [], currentIndex: 0, sessionResults: [], startTime: null, selectedMethod: null };
    renderScreen('home');
  });
}

function renderMethodsScreen(root) {
  if (!methodsScreenState.a || !methodsScreenState.op || !methodsScreenState.b) {
    renderMethodsInput(root);
  } else if (methodsScreenState.showingComparison) {
    renderMethodsComparison(root);
  } else if (methodsScreenState.selectedMethod) {
    renderMethodSolve(root);
  } else {
    renderMethodSelection(root);
  }
}

function renderMethodsInput(root) {
  root.innerHTML = `
    <div class="card">
      <h1>Mental Math Methods 🧠</h1>
      <p>Learn and compare different strategies for solving arithmetic problems.</p>
    </div>
    <div class="card">
      <h2>Choose a Problem</h2>
      <div class="problem-input-grid">
        <div class="input-group">
          <label>First Number</label>
          <input type="number" id="input-a" class="number-input" value="347" />
        </div>
        <div class="input-group">
          <label>Operation</label>
          <select id="input-op" class="operation-select">
            <option value="+">Addition (+)</option>
            <option value="-">Subtraction (−)</option>
          </select>
        </div>
        <div class="input-group">
          <label>Second Number</label>
          <input type="number" id="input-b" class="number-input" value="298" />
        </div>
      </div>
      <div class="button-group" style="margin-top: 1.5rem;">
        <button class="btn btn-primary" id="solve-btn">Solve This Problem</button>
        <button class="btn btn-secondary" id="random-btn">Random Problem</button>
      </div>
    </div>
    <div class="card">
      <h3>Quick Examples</h3>
      <div class="example-problems">
        <button class="example-btn" data-problem="347+298">347 + 298</button>
        <button class="example-btn" data-problem="503-187">503 − 187</button>
        <button class="example-btn" data-problem="503-496">503 − 496</button>
        <button class="example-btn" data-problem="642+359">642 + 359</button>
      </div>
    </div>
  `;

  document.getElementById('solve-btn').addEventListener('click', () => {
    const a = parseInt(document.getElementById('input-a').value);
    const op = document.getElementById('input-op').value;
    const b = parseInt(document.getElementById('input-b').value);
    if (!isNaN(a) && !isNaN(b) && (op === '+' || op === '-')) {
      methodsScreenState = { a, op, b, selectedMethod: null, currentStep: 0, solution: null, showingComparison: false };
      renderScreen('methods');
    }
  });

  document.getElementById('random-btn').addEventListener('click', () => {
    const op = Math.random() > 0.5 ? '+' : '-';
    const a = Math.floor(Math.random() * 900) + 100;
    const b = Math.floor(Math.random() * 900) + 100;
    document.getElementById('input-a').value = a;
    document.getElementById('input-op').value = op;
    document.getElementById('input-b').value = b;
  });

  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const problem = btn.dataset.problem;
      const match = problem.match(/(\d+)([\+\−])(\d+)/);
      if (match) {
        const a = parseInt(match[1]);
        const op = match[2] === '−' ? '-' : '+';
        const b = parseInt(match[3]);
        methodsScreenState = { a, op, b, selectedMethod: null, currentStep: 0, solution: null, showingComparison: false };
        renderScreen('methods');
      }
    });
  });
}

function renderMethodSelection(root) {
  const { a, op, b } = methodsScreenState;
  const methods = getApplicableMethods(a, op, b);

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="card">
      <div class="problem-header">
        <h2>Solve: ${a} ${op} ${b} = ?</h2>
        <button class="btn btn-secondary btn-small" id="change-problem-btn">Change Problem</button>
      </div>
    </div>
  `;
  root.appendChild(container);

  const cardsContainer = renderMethodCards(methods, (methodId, method) => {
    methodsScreenState.selectedMethod = method;
    methodsScreenState.solution = method.module.solve(a, op, b);
    methodsScreenState.currentStep = 0;
    renderScreen('methods');
  }, expansionData?.methodMastery || {});

  root.appendChild(cardsContainer);

  document.getElementById('change-problem-btn').addEventListener('click', () => {
    methodsScreenState = { a: null, op: null, b: null, selectedMethod: null, currentStep: 0, solution: null, showingComparison: false };
    renderScreen('methods');
  });
}

function renderMethodSolve(root) {
  const { a, op, b, selectedMethod, solution } = methodsScreenState;

  const container = document.createElement('div');
  container.className = 'method-solve-container';
  container.innerHTML = `
    <div class="solve-header">
      <h2>${a} ${op} ${b} = ?</h2>
      <div class="method-badge">${selectedMethod.icon} ${selectedMethod.name}</div>
    </div>
  `;
  root.appendChild(container);

  const methodColors = {
    partitioning: '#42a5f5',
    sequencing: '#66bb6a',
    compensation: '#ffa726',
    same_difference: '#ab47bc',
    column: '#78909c',
    counting_on: '#26c6da'
  };

  const methodColor = methodColors[selectedMethod.id] || '#42a5f5';

  const stepsDisplay = renderSteps(solution.steps, 'animated', {
    autoAdvance: false,
    methodColor: methodColor,
    onAllComplete: () => {
      showCompletionControls();
    }
  });

  container.appendChild(stepsDisplay);

  function showCompletionControls() {
    const controls = document.createElement('div');
    controls.className = 'solve-controls';
    controls.innerHTML = `
      <div class="final-answer">Answer: <strong>${solution.answer}</strong></div>
      <div class="button-group">
        <button class="btn btn-primary" id="compare-btn">Compare Methods</button>
        <button class="btn btn-secondary" id="solve-another-btn">Solve Another</button>
        <button class="btn btn-secondary" id="try-different-btn">Try Different Method</button>
      </div>
    `;
    container.appendChild(controls);

    document.getElementById('compare-btn').addEventListener('click', () => {
      methodsScreenState.showingComparison = true;
      renderScreen('methods');
    });

    document.getElementById('solve-another-btn').addEventListener('click', () => {
      methodsScreenState = { a: null, op: null, b: null, selectedMethod: null, currentStep: 0, solution: null, showingComparison: false };
      renderScreen('methods');
    });

    document.getElementById('try-different-btn').addEventListener('click', () => {
      methodsScreenState.selectedMethod = null;
      methodsScreenState.currentStep = 0;
      methodsScreenState.solution = null;
      methodsScreenState.showingComparison = false;
      renderScreen('methods');
    });
  }
}

function renderMethodsComparison(root) {
  const { a, op, b } = methodsScreenState;
  const methods = getApplicableMethods(a, op, b);

  const container = document.createElement('div');
  container.innerHTML = `
    <div class="card">
      <h2>Method Comparison</h2>
      <p>See how different methods solve the same problem</p>
    </div>
  `;
  root.appendChild(container);

  const comparison = renderComparison(a, op, b, methods, (methodId) => {
    console.log(`User preferred method: ${methodId}`);
  });

  root.appendChild(comparison);

  const controls = document.createElement('div');
  controls.className = 'comparison-controls';
  controls.innerHTML = `
    <button class="btn btn-primary" id="solve-another-btn">Solve Another Problem</button>
    <button class="btn btn-secondary" id="back-methods-btn">Back to Method Selection</button>
  `;
  root.appendChild(controls);

  document.getElementById('solve-another-btn').addEventListener('click', () => {
    methodsScreenState = { a: null, op: null, b: null, selectedMethod: null, currentStep: 0, solution: null, showingComparison: false };
    renderScreen('methods');
  });

  document.getElementById('back-methods-btn').addEventListener('click', () => {
    methodsScreenState.showingComparison = false;
    methodsScreenState.selectedMethod = null;
    renderScreen('methods');
  });
}

function renderDiagnosticsScreen(root, params = {}) {
  const { active, resolved } = getAllMisunderstandings();
  const priorityList = getRemediationPriority();

  root.innerHTML = `
    <div class="card">
      <h1>Diagnostics & Support 🔍</h1>
      <p>Identify and work on specific areas that need attention.</p>
    </div>

    ${active.length > 0 ? `
      <div class="card">
        <h2>Active Misunderstandings (${active.length})</h2>
        <p>These are areas where focused practice will help:</p>
        <div class="misunderstanding-cards">
          ${priorityList.map(m => `
            <div class="misunderstanding-card">
              <div class="misunderstanding-header">
                <h3>${m.name}</h3>
                <span class="severity-badge severity-${m.severity}">${m.severity === 3 ? 'High' : m.severity === 2 ? 'Medium' : 'Low'} Priority</span>
              </div>
              <p class="misunderstanding-description">${m.description}</p>
              <p class="misunderstanding-cause"><strong>Root Cause:</strong> ${m.rootCause}</p>
              <div class="misunderstanding-stats">
                <span>Confidence: ${Math.round(m.confidence * 100)}%</span>
                <span>Detected: ${m.detectionCount} time${m.detectionCount > 1 ? 's' : ''}</span>
              </div>
              <button class="btn btn-primary" onclick="window.expansionApp.renderScreen('remediation', {id: '${m.id}'})">Start Remediation</button>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${resolved.length > 0 ? `
      <div class="card">
        <h2>Resolved Issues (${resolved.length}) ✅</h2>
        <p>Great job! You've mastered these concepts:</p>
        <ul class="resolved-list">
          ${resolved.map(m => `<li><strong>${m.name}</strong> - Resolved on ${new Date(m.resolvedAt).toLocaleDateString()}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div class="card">
      <h2>Take a Diagnostic Quiz</h2>
      <p>Not sure where you need help? Take a diagnostic quiz to identify areas for improvement.</p>
      <div class="quiz-options">
        <button class="btn btn-primary btn-large" id="start-both">Explore Both Addition & Subtraction</button>
        <button class="btn btn-secondary" id="start-addition">Just Addition For Now</button>
        <button class="btn btn-secondary" id="start-subtraction">Just Subtraction For Now</button>
      </div>
    </div>
  `;

  // Add event listeners for quiz start buttons
  setTimeout(() => {
    const bothBtn = document.getElementById('start-both');
    const additionBtn = document.getElementById('start-addition');
    const subtractionBtn = document.getElementById('start-subtraction');

    if (bothBtn) {
      bothBtn.addEventListener('click', () => {
        createDiagnosticQuiz('both');
        renderQuizScreen(root);
      });
    }

    if (additionBtn) {
      additionBtn.addEventListener('click', () => {
        createDiagnosticQuiz('addition');
        renderQuizScreen(root);
      });
    }

    if (subtractionBtn) {
      subtractionBtn.addEventListener('click', () => {
        createDiagnosticQuiz('subtraction');
        renderQuizScreen(root);
      });
    }
  }, 100);
}

/**
 * Renders the remediation screen for a specific misunderstanding.
 * @param {HTMLElement} root - Root element
 * @param {Object} params - Parameters including misunderstanding ID
 */
function renderRemediationScreen(root, params = {}) {
  if (!params.id) {
    root.innerHTML = '<div class="card"><p>No misunderstanding specified.</p></div>';
    return;
  }

  startRemediationUnit(root, params.id);
}

/**
 * Renders the visual demo screen to test number line and ten frames.
 * @param {HTMLElement} root - Root element
 */
function renderVisualDemoScreen(root) {
  root.innerHTML = `
    <div class="card">
      <h1>Visual Components Demo 🎨</h1>
      <p>Testing the visual components: number line, ten frames, base-10 blocks, and part-whole models.</p>
    </div>

    <div class="visual-demo-grid">
      <div class="visual-demo-card">
        <h2>Number Line Visual</h2>
        <p>Shows counting on, sequencing, and compensation with animated jumps.</p>
        <div id="number-line-demo" class="visual-container"></div>
        <div class="demo-controls">
          <button class="btn btn-primary" id="demo-counting-on">Demo: Counting On (7+3)</button>
          <button class="btn btn-primary" id="demo-sequencing">Demo: Sequencing (347+256)</button>
          <button class="btn btn-secondary" id="demo-clear-line">Clear</button>
        </div>
      </div>

      <div class="visual-demo-card">
        <h2>Ten Frame Visual</h2>
        <p>Shows number bonds and making 10 strategy with animated dots.</p>
        <div id="ten-frame-demo" class="visual-container"></div>
        <div class="demo-controls">
          <button class="btn btn-primary" id="demo-make-10">Demo: Make 10 (7+5)</button>
          <button class="btn btn-primary" id="demo-add-dots">Demo: Add 8 Dots</button>
          <button class="btn btn-secondary" id="demo-clear-frame">Clear</button>
        </div>
      </div>

      <div class="visual-demo-card">
        <h2>Base-10 Blocks Visual</h2>
        <p>Shows place value with colored blocks (ones, tens, hundreds, thousands).</p>
        <div id="base10-demo" class="visual-container"></div>
        <div class="demo-controls">
          <button class="btn btn-primary" id="demo-show-number">Demo: Show 347</button>
          <button class="btn btn-primary" id="demo-break-ten">Demo: Break Ten</button>
          <button class="btn btn-secondary" id="demo-clear-blocks">Clear</button>
        </div>
      </div>

      <div class="visual-demo-card">
        <h2>Part-Whole Model Visual</h2>
        <p>Shows number bonds and fact families with cherry diagram.</p>
        <div id="part-whole-demo" class="visual-container"></div>
        <div class="demo-controls">
          <button class="btn btn-primary" id="demo-show-pw">Demo: Show 12 = 7 + 5</button>
          <button class="btn btn-primary" id="demo-split">Demo: Split Animation</button>
          <button class="btn btn-secondary" id="demo-clear-pw">Clear</button>
        </div>
      </div>
    </div>
  `;

  // Number Line demos
  const numberLineCon = document.getElementById('number-line-demo');
  let numberLine = new NumberLineVisual(numberLineCon, { min: 0, max: 20, start: 7 });
  numberLine.render();

  document.getElementById('demo-counting-on').addEventListener('click', () => {
    numberLine.clear();
    numberLine.animateJumps([
      { from: 7, to: 8, label: '+1', colour: '#4CAF50' },
      { from: 8, to: 9, label: '+1', colour: '#4CAF50' },
      { from: 9, to: 10, label: '+1', colour: '#4CAF50' }
    ]);
  });

  document.getElementById('demo-sequencing').addEventListener('click', () => {
    numberLine = new NumberLineVisual(numberLineCon, { min: 300, max: 650, start: 347 });
    numberLine.render();
    numberLine.animateJumps([
      { from: 347, to: 547, label: '+200', colour: '#42A5F5' },
      { from: 547, to: 597, label: '+50', colour: '#66BB6A' },
      { from: 597, to: 603, label: '+6', colour: '#FFB74D' }
    ], 1200);
  });

  document.getElementById('demo-clear-line').addEventListener('click', () => {
    numberLine.clear();
  });

  // Ten Frame demos
  const tenFrameCon = document.getElementById('ten-frame-demo');
  let tenFrame = new TenFrameVisual(tenFrameCon, { colours: ['#E57373', '#42A5F5'] });
  tenFrame.render(0);

  document.getElementById('demo-make-10').addEventListener('click', () => {
    tenFrame = new TenFrameVisual(tenFrameCon, { colours: ['#E57373', '#42A5F5'] });
    tenFrame.animateMake10(7, 5);
  });

  document.getElementById('demo-add-dots').addEventListener('click', () => {
    tenFrame = new TenFrameVisual(tenFrameCon, { colours: ['#4CAF50', '#42A5F5'] });
    tenFrame.render(0);
    setTimeout(() => tenFrame.animateAdd(8, '#4CAF50'), 300);
  });

  document.getElementById('demo-clear-frame').addEventListener('click', () => {
    tenFrame = new TenFrameVisual(tenFrameCon);
    tenFrame.render(0);
  });

  // Base-10 Blocks demos
  const base10Con = document.getElementById('base10-demo');
  let base10 = new Base10Visual(base10Con);
  base10.renderNumber(0);

  document.getElementById('demo-show-number').addEventListener('click', () => {
    base10 = new Base10Visual(base10Con);
    base10.renderNumber(347);
  });

  document.getElementById('demo-break-ten').addEventListener('click', () => {
    base10 = new Base10Visual(base10Con);
    base10.renderNumber(15);
    setTimeout(() => base10.animateBreak('tens'), 500);
  });

  document.getElementById('demo-clear-blocks').addEventListener('click', () => {
    base10 = new Base10Visual(base10Con);
    base10.renderNumber(0);
  });

  // Part-Whole Model demos
  const partWholeCon = document.getElementById('part-whole-demo');
  let partWhole = new PartWholeVisual(partWholeCon);
  partWhole.render(0, 0, 0);

  document.getElementById('demo-show-pw').addEventListener('click', () => {
    partWhole = new PartWholeVisual(partWholeCon);
    partWhole.render(12, 7, 5);
  });

  document.getElementById('demo-split').addEventListener('click', () => {
    partWhole = new PartWholeVisual(partWholeCon);
    partWhole.animateSplit(12, 7, 5);
  });

  document.getElementById('demo-clear-pw').addEventListener('click', () => {
    partWhole = new PartWholeVisual(partWholeCon);
    partWhole.render(0, 0, 0);
  });
}

function renderProgressScreen(root) {
  renderComingSoon(root, 'Progress Dashboard');
}

function renderNotFoundScreen(root) {
  root.innerHTML = `
    <div class="coming-soon">
      <h2>Screen Not Found</h2>
      <p>The requested screen could not be found.</p>
      <button class="btn btn-primary" onclick="window.expansionApp.renderScreen('home')">
        Back to Home
      </button>
    </div>
  `;
}

// Export public API
export const expansionApp = {
  init,
  renderScreen
};

// Make available globally for HTML onclick handlers
window.expansionApp = expansionApp;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

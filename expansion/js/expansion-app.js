/**
 * Expansion App Entry Point
 * Main application router and screen management for the expansion module.
 */

import { COLOURS, PROGRESSION_LEVELS, METHOD_DEFINITIONS, ADDITION_STRATEGIES } from './expansion-config.js';
import { loadExpansionData } from './data/expansion-storage.js';
import { startPractice, getNextProblem, submitAnswer, endPractice, getCurrentSession } from './facts/addition-practice.js';

// Current screen state
let currentScreen = 'home';
let expansionData = null;
let currentProblem = null;
let showingHint = false;

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
      renderAdditionFactsScreen(root);
      break;
    case 'subtraction-facts':
      renderSubtractionFactsScreen(root);
      break;
    case 'levels':
      renderLevelsScreen(root);
      break;
    case 'methods':
      renderMethodsScreen(root);
      break;
    case 'diagnostics':
      renderDiagnosticsScreen(root);
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
      id: 'levels',
      title: 'Progressive Levels',
      description: 'Apply skills to larger numbers (2-digit to 4-digit)',
      icon: '📊',
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
      id: 'progress',
      title: 'Progress Dashboard',
      description: 'View your mastery and track your journey',
      icon: '📈',
      status: 'unlocked'
    }
  ];

  const container = document.createElement('div');
  container.innerHTML = `
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
  const session = getCurrentSession();

  if (session) {
    renderPracticeScreen(root);
  } else if (params.showSummary) {
    renderSummaryScreen(root, params.summary);
  } else {
    renderStrategySelector(root);
  }
}

function renderStrategySelector(root) {
  expansionData = loadExpansionData();
  const strategyGroups = expansionData.additionFacts.strategyGroups;

  // Count unlocked strategies
  const unlockedCount = Object.values(strategyGroups).filter(s => s.status === 'unlocked').length;

  const container = document.createElement('div');
  container.innerHTML = `
    <button class="btn btn-secondary" onclick="window.expansionApp.renderScreen('home')" style="margin-bottom: 1rem;">
      ← Back to Home
    </button>
    <div class="card">
      <h1>Addition Facts Practice</h1>
      <p>Master addition strategies by working through them in order. Each strategy builds on the previous ones.</p>
      ${unlockedCount >= 3 ? '<button class="btn btn-primary" id="mixed-practice-btn" style="margin-top: 1rem;">Start Mixed Practice (All Unlocked)</button>' : ''}
    </div>
    <div class="strategy-list" id="strategy-list"></div>
  `;

  root.appendChild(container);

  // Add event listener for mixed practice
  if (unlockedCount >= 3) {
    document.getElementById('mixed-practice-btn').addEventListener('click', () => {
      startPractice('mixed', 20);
      renderScreen('addition-facts');
    });
  }

  // Render strategy cards
  const strategyList = document.getElementById('strategy-list');
  ADDITION_STRATEGIES.forEach(strategy => {
    const groupData = strategyGroups[strategy.id] || { status: 'locked', percentComplete: 0 };
    const card = createStrategyCard(strategy, groupData);
    strategyList.appendChild(card);
  });
}

function createStrategyCard(strategy, groupData) {
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
    btn.addEventListener('click', () => {
      startPractice(strategy.id, 20);
      renderScreen('addition-facts');
    });
  }

  return card;
}

function renderPracticeScreen(root) {
  const session = getCurrentSession();

  if (!session) {
    renderStrategySelector(root);
    return;
  }

  if (!currentProblem) {
    currentProblem = getNextProblem();
  }

  if (!currentProblem) {
    // Session ended
    const summary = endPractice();
    renderScreen('addition-facts', { showSummary: true, summary });
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
        <span class="operator">+</span>
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
  document.getElementById('submit-btn').addEventListener('click', handleSubmit);
  document.getElementById('hint-btn').addEventListener('click', showHint);
  document.getElementById('quit-btn').addEventListener('click', () => {
    const summary = endPractice();
    renderScreen('addition-facts', { showSummary: true, summary });
  });

  const input = document.getElementById('answer-input');
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  });
}

function handleSubmit() {
  const input = document.getElementById('answer-input');
  const answer = input.value;

  if (!answer) return;

  const result = submitAnswer(answer);

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
    renderScreen('addition-facts');
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

function renderSummaryScreen(root, summary) {
  const accuracyPercent = Math.round(summary.accuracy * 100);
  const avgTimeSec = (summary.avgTime / 1000).toFixed(1);

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
    renderScreen('addition-facts');
  });

  document.getElementById('back-home-btn').addEventListener('click', () => {
    renderScreen('home');
  });
}

function renderSubtractionFactsScreen(root) {
  renderComingSoon(root, 'Subtraction Facts');
}

function renderLevelsScreen(root) {
  renderComingSoon(root, 'Progressive Levels');
}

function renderMethodsScreen(root) {
  renderComingSoon(root, 'Mental Math Methods');
}

function renderDiagnosticsScreen(root) {
  renderComingSoon(root, 'Diagnostics & Support');
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

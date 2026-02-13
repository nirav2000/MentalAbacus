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

// Current screen state
let currentScreen = 'home';
let expansionData = null;
let currentProblem = null;
let showingHint = false;
let currentOperation = 'addition'; // 'addition' or 'subtraction'

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
  renderComingSoon(root, 'Progressive Levels');
}

function renderMethodsScreen(root) {
  renderComingSoon(root, 'Mental Math Methods');
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

/**
 * Expansion App Entry Point
 * Main application router and screen management for the expansion module.
 */

import { COLOURS, PROGRESSION_LEVELS, METHOD_DEFINITIONS } from './expansion-config.js';
import { loadExpansionData } from './data/expansion-storage.js';

// Current screen state
let currentScreen = 'home';
let expansionData = null;

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
function renderAdditionFactsScreen(root) {
  renderComingSoon(root, 'Addition Facts');
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

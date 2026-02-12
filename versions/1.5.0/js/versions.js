/* versions.js - Version history archive
   Each release is archived here so users can view the changelog in-app.
   Archived source snapshots live in /versions/{version}/ folders.
   Add a new entry at the TOP of the array for each commit/release.
*/

const VERSION_HISTORY = [
    {
        version: '1.5.0',
        date: '2026-02-12',
        title: 'Avatar Fix, Question History & Teacher Unlock',
        current: true,
        changes: [
            'Fixed: Avatar no longer covers quiz UI — moved into feedback row',
            'Added: Per-strategy question history dropdown showing variations, frequency, correctness, and avg time',
            'Added: Teacher module unlock — teachers can unlock locked strategies for any student',
            'Updated: Unlock logic in engine and home screen respects teacher overrides',
        ],
    },
    {
        version: '1.4.0',
        date: '2026-02-11',
        title: 'Module Pattern Refactor',
        current: false,
        changes: [
            'Refactored: Split app.js into app-core.js, app-quiz.js, and app-screens.js using Object.assign module pattern',
            'Improved: Each module is under 280 lines for easier maintenance',
            'Updated: Service worker cache list for new file structure',
        ],
    },
    {
        version: '1.3.0',
        date: '2026-02-11',
        title: 'Major Feature Update',
        current: false,
        changes: [
            'Added: Session drill-down — tap sessions to see questions, answers, and times',
            'Added: Larger interactive visual aids — tappable dots, clickable number lines',
            'Added: Teacher/parent dashboard with PIN protection and player comparison',
            'Added: Spaced repetition (SM-2 algorithm) with toggle in settings',
            'Added: Offline PWA support — installable on tablets with service worker',
            'Added: CSV and PDF export alongside JSON',
            'Added: Goal setting with strategy targets, deadlines, and visual progress',
            'Added: Visual stats dashboard with bar charts, line charts, and sparklines',
            'Added: Encouraging messages and avatar character reacting to performance',
            'Added: Daily challenge mode with streak tracking',
            'Added: Incorrect questions flagged for automatic retry',
            'Added: Weakest strategy indicator and response time trends',
            'Added: Strategy intervention with worked examples after 2+ wrong in a row',
            'Added: Practice mode (no timer) from intervention popups',
            'Added: Settings screen with toggles for all features',
        ],
    },
    {
        version: '1.2.0',
        date: '2026-02-11',
        title: 'Duplicate Question Fix',
        current: false,
        changes: [
            'Fixed: Questions no longer repeat within a session',
            'Added: Session-level deduplication with retry logic for unique question generation',
        ],
    },
    {
        version: '1.1.0',
        date: '2026-02-11',
        title: 'Export Fix & Version History',
        current: false,
        changes: [
            'Fixed: JSON export now includes full question log data (question text, answers, time per question)',
            'Added: Question log index for efficient data retrieval',
            'Added: Version history screen accessible from the app',
            'Added: Changelog viewer with full release archive',
            'Added: Source snapshots archived per version in /versions/ folder',
        ],
    },
    {
        version: '1.0.0',
        date: '2026-02-11',
        title: 'Initial Release',
        current: false,
        changes: [
            'All 12 mental math strategy problem generators',
            'Adaptive difficulty engine with time and accuracy metrics',
            'Firebase-compatible data layer with localStorage',
            'Session logging and per-question progress tracking',
            'Progress dashboard and stats view',
            'Teaching/hint system with visual aids for struggling students',
            'Multi-player support with isolated data per player',
            'Mobile-optimised responsive design with numpad input',
            'JSON data export for teacher review',
        ],
    },
];

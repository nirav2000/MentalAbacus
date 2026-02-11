/* versions.js - Version history archive
   Each release is archived here so users can view the changelog in-app.
   Archived source snapshots live in /versions/{version}/ folders.
   Add a new entry at the TOP of the array for each commit/release.
*/

const VERSION_HISTORY = [
    {
        version: '1.2.0',
        date: '2026-02-11',
        title: 'Duplicate Question Fix',
        current: true,
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

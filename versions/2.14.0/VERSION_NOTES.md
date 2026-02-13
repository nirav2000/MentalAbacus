# Mental Math Expansion v2.14.0

**Release Date:** 2026-02-13
**Prompt:** 15 of 20

## New Features

### Progressive Practice Levels System
Complete multi-digit problem generator with adaptive difficulty for Levels 2-5.

**1. Problem Generator** (`expansion/js/problems/problem-generator.js` - 223 lines)
- **Core Functions**:
  - `generateProblem(level, operation, difficulty)` - Generate single problem with metadata
  - `generateProblemSet(level, operation, difficulty, count)` - Generate set of unique problems

- **Level Configurations**:
  - **Level 2**: Two-digit ± single-digit (e.g., 34 + 7, 52 - 8)
    - Easy: 10-50 ± 1-5, no carrying/borrowing
    - Medium: 20-89 ± 3-9, up to 1 carry/borrow
    - Hard: 50-99 ± 6-9, requires carrying/borrowing

  - **Level 3**: Two-digit ± two-digit (e.g., 47 + 35, 82 - 46)
    - Easy: 20-50 ± 10-30, no carrying/borrowing
    - Medium: 30-89 ± 20-60, up to 1 carry/borrow
    - Hard: 50-99 ± 40-89, requires carrying/borrowing

  - **Level 4**: Three-digit ± two/three-digit (e.g., 347 + 256, 503 - 187)
    - Easy: 100-500 ± 20-200, no carrying/borrowing
    - Medium: 200-899 ± 100-500, up to 2 carries/borrows
    - Hard: 400-999 ± 200-899, includes zeros, chain borrowing

  - **Level 5**: Four-digit and beyond (e.g., 4,372 + 1,859)
    - Easy: 1000-5000 ± 100-2000, minimal carrying/borrowing
    - Medium: 2000-8999 ± 1000-5000, up to 3 carries/borrows
    - Hard: 5000-9999 ± 2000-8999, includes zeros, chain borrowing

- **Difficulty Factors**:
  - Carrying/borrowing requirements (controlled by maxCarries/minCarries)
  - Chain borrowing through consecutive zeros
  - Crossing tens/hundreds boundaries
  - Presence of zeros in numbers
  - Proximity to round numbers (for compensation method)
  - Small differences (< 20 for counting on method)

- **Problem Metadata**:
  Each problem includes analysis:
  - Number of carries/borrows required
  - Whether chain borrowing is needed
  - Whether it crosses tens/hundreds
  - Whether numbers have zeros
  - Whether numbers are near round values (for method recommendation)
  - Whether difference is small (< 20)

**2. Difficulty Engine** (`expansion/js/problems/difficulty-engine.js` - 163 lines)
- **Adaptive Difficulty Adjustment**:
  - `adjustDifficulty(recentResults, currentDifficulty)` - Adjusts based on performance
    - All 5 correct and fast (< 15s avg) → increase difficulty
    - 3 or fewer correct out of 5 → decrease difficulty
    - Otherwise → maintain current difficulty

- **Smart Problem Selection**:
  - `selectNextProblem(level, operation, userHistory)` - Priority system:
    1. **Remediation** (highest priority): If active misunderstandings exist
    2. **Spaced Repetition** (30% chance): Review previously struggled problems
    3. **New Material**: Generate new problem at adjusted difficulty

- **Spaced Repetition System**:
  - Tracks problems user got wrong or took too long (> 30s)
  - Review intervals: 1 day, 3 days, 7 days
  - Brings back struggled problems at optimal times

- **Level Unlock Logic**:
  - `shouldUnlockNextLevel(levelHistory, currentLevel)` - Criteria:
    - 80%+ accuracy over last 10 problems, OR
    - 70%+ accuracy over last 20 problems

- **Session Statistics**:
  - `calculatePracticeSessionStats(results)` - Comprehensive stats:
    - Total problems, correct, incorrect
    - Accuracy percentage
    - Average time per problem
    - Methods used breakdown
    - List of struggled problems for review

- **Method Recommendation**:
  - `recommendMethod(problem)` - Suggests best method based on problem characteristics:
    - Small difference (< 20) → Counting On
    - Near round number → Compensation
    - No carries/borrows → Partitioning
    - Chain borrowing → Column Method
    - Default → Sequencing

**3. Practice Levels UI** (Updated `expansion/js/expansion-app.js` - ~260 lines added)

**Level Selection Screen**:
- Grid of level cards (2, 3, 4, 5)
- Each card shows:
  - Level number and name
  - Example problems
  - Lock status (✓ Unlocked / 🔒 Locked)
- Hover effects and click to select

**Operation Choice Screen**:
- Three large buttons:
  - ➕ Addition
  - ➖ Subtraction
  - 🔀 Mixed (random)
- Back to levels button

**Practice Session Screen**:
- **Header Bar**:
  - Level badge (e.g., "Level 2")
  - Progress badge (e.g., "Problem 3 / 10")
  - End Practice button

- **Problem Display**:
  - Large equation in monospace font (e.g., "347 + 256 = ?")
  - Answer input field (large, centered, number type)
  - Check Answer button (becomes "Next Problem →" after answering)

- **Instant Feedback**:
  - ✓ Correct: Green banner with checkmark, 1.5s delay to next
  - ✗ Incorrect: Red banner showing correct answer, 3s delay to next
  - Animated pop-in effects

- **Live Statistics**:
  - Mini stats bar below problem:
    - Correct count
    - Incorrect count
    - Current accuracy percentage

**Results Screen**:
- **Large Accuracy Display**: Giant percentage (e.g., "85%")
- **Breakdown Stats**:
  - ✓ X Correct
  - ✗ X Incorrect
  - ⏱ Xs average time
- **Unlock Banner** (if applicable):
  - "🎊 Level X Unlocked!"
  - Appears when user meets unlock criteria (70-80% accuracy)
- **Action Buttons**:
  - Practice Again (same level/operation)
  - Choose Different Level
  - Back to Home

**4. Comprehensive Styling** (`expansion/css/levels.css` - 473 lines)

**Level Cards**:
- Grid layout, responsive (1-4 columns)
- Hover lift effect with blue border
- Lock state (50% opacity, no interaction)
- Status badges (green unlocked, gray locked)

**Operation Choice**:
- Large buttons with icons and labels
- Vertical layout on mobile
- 3rem icon size, prominent text

**Practice Interface**:
- Clean header bar with badges
- 3rem problem equation font size
- 2rem answer input, centered, large tap target
- Touch-friendly inputs (60px height on mobile)

**Feedback Animations**:
- feedbackPop keyframe (scale 0.8 → 1.05 → 1)
- Color-coded borders (green/red)
- Large icons and text for visibility

**Results Display**:
- 5rem accuracy percentage
- Breakdown items in card layout
- Gold gradient unlock banner
- Blue encouragement banner (if accuracy < 70%)

**Responsive Design**:
- Mobile: Single column cards, vertical buttons, smaller fonts
- Tablet: 2 columns, medium sizes
- Desktop: 4 columns, full sizes
- Touch devices: Larger tap targets, simplified layouts

## User Flow

### Complete Practice Journey:
1. **Start**: Navigate to "Progressive Levels" from home
2. **Select Level**: Click level card (e.g., Level 2)
3. **Choose Operation**: Select Addition, Subtraction, or Mixed
4. **Practice Session**:
   - System generates 10 problems at medium difficulty
   - Solve each problem, get instant feedback
   - See running statistics (correct, incorrect, accuracy)
   - Auto-advance after delay (1.5s correct, 3s incorrect)
5. **View Results**:
   - See overall accuracy, correct/incorrect counts, average time
   - Unlock notification if criteria met
   - Choose to practice again or try different level
6. **Adaptive Difficulty** (future sessions):
   - If performing well (5/5 correct, fast) → problems get harder
   - If struggling (≤3/5 correct) → problems get easier
   - System tracks history for optimal learning

## Technical Implementation

### Architecture:
- **problem-generator.js**: Data layer - generates problems with metadata
- **difficulty-engine.js**: Logic layer - adaptive selection and stats
- **expansion-app.js**: Presentation layer - UI screens and state management
- **levels.css**: Style layer - visual design and responsiveness

### State Management:
```javascript
levelsScreenState = {
  level: 2,
  operation: '+',
  difficulty: 'medium',
  currentProblem: { a: 47, operation: '+', b: 35, answer: 82, metadata: {...} },
  problemSet: [ /* 10 problems */ ],
  currentIndex: 3,
  sessionResults: [
    { problem: {...}, userAnswer: 82, correct: true, timeSeconds: 8.5, timestamp: 1707847200000 },
    // ...
  ],
  startTime: 1707847200000,
  selectedMethod: null
}
```

### Problem Generation Algorithm:
1. Get level configuration (min/max ranges, constraints, requirements)
2. Generate random numbers within ranges
3. Check constraints (avoid/include zeros)
4. Verify requirements (carrying/borrowing counts, difference size)
5. Retry if requirements not met (max 100 attempts)
6. Analyze problem metadata (carries, borrows, special characteristics)
7. Return problem with full metadata

### Adaptive System:
- Tracks last 5 problems
- Calculates accuracy and average time
- Adjusts difficulty: easy ↔ medium ↔ hard
- Never asks same problem twice in session (Set deduplication)

## Pedagogical Impact

Students can now:
- ✅ **Practice at their level** - Start where they're comfortable
- ✅ **Experience adaptive learning** - Problems adjust to their ability
- ✅ **Build computational fluency** - Hundreds of unique problems per level
- ✅ **Track progress visually** - See accuracy and improvement in real-time
- ✅ **Unlock achievements** - Motivation through level unlocks
- ✅ **Review struggled problems** - Spaced repetition for mastery

Teachers gain:
- Level-by-level performance analytics
- Difficulty progression data
- Time-per-problem insights
- Struggling problem identification
- Unlock progression tracking

## Files Created
1. `expansion/js/problems/problem-generator.js` (223 lines) - Problem generation logic
2. `expansion/js/problems/difficulty-engine.js` (163 lines) - Adaptive difficulty system
3. `expansion/css/levels.css` (473 lines) - Complete styling for practice levels

## Files Modified
1. `expansion/js/expansion-app.js` - Added complete practice levels implementation (~260 lines added)
   - Imported problem-generator and difficulty-engine modules
   - Added levelsScreenState object
   - Replaced renderLevelsScreen with full implementation
   - Added renderLevelSelection, showOperationChoice, startPracticeSession functions
   - Added renderPracticeProblem with instant feedback
   - Added renderPracticeResults with statistics
2. `expansion/expansion.html` - Added levels.css link, version updated to v2.14.0
3. `expansion/js/data/expansion-storage.js` - Version updated to 2.14.0

## Implementation Plan Progress
- ✅ Prompt 1-7: Core infrastructure, facts, diagnostics, remediation
- ✅ Prompt 8-9: Visual components (number line, ten frames, base-10, part-whole)
- ✅ Prompt 10-12: All 6 calculation methods (partitioning, sequencing, compensation, same difference, column, counting on)
- ✅ Prompt 13: Method selection and comparison system
- ✅ Prompt 14: Reusable step display component
- ✅ Prompt 15: Multi-digit problem generator and adaptive practice levels
- ⏳ Prompt 16-20: Integration, polish, word problems, final features

## Next Steps (Prompt 16)
Potential directions:
- Integrate method selection into practice sessions (let users choose solving strategy)
- Add step-by-step guided practice mode with hints
- Build performance dashboard showing mastery by level
- Add timed challenges and fluency drills
- Create custom practice mode (user selects difficulty parameters)
- Implement full spaced repetition system with review scheduler

## Notes
- User explicitly allowed files to exceed 150 lines for this prompt
- Problem generator uses constraint-based generation with retry logic
- All problems verified to meet difficulty requirements before being used
- Metadata enables future method recommendation and problem analysis
- System designed for future integration with method training and remediation

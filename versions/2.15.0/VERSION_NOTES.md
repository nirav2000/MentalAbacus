# Mental Math Expansion v2.15.0

**Release Date:** 2026-02-13
**Prompt:** 16 of 20

## New Features

### Complete Word Problem System
Natural-sounding word problems with layered scaffolding support for comprehension and problem-solving.

**1. Word Problem Templates** (`expansion/js/problems/word-problem-templates.js` - 229 lines)

- **8 Problem Categories** with 3-5 variations each:
  1. **Join (Result Unknown)** - "Sam had 347 stickers. He got 256 more. How many now?"
  2. **Separate (Result Unknown)** - "A shop had 503 apples. 187 were sold. How many left?"
  3. **Join (Change Unknown)** - "Mia had 245 beads. After buying more, she had 512. How many did she buy?"
  4. **Separate (Change Unknown)** - "Had 500 coins. After giving some away, 312 remain. How many given?"
  5. **Separate (Start Unknown)** - "Some children on bus. 28 got off, 34 stayed. How many at first?"
  6. **Compare (Difference)** - "Class A raised £472. Class B raised £319. How much more?"
  7. **Compare (Bigger Unknown)** - "Tom has 156 cards, 89 more than Amy. How many does Amy have?"
  8. **Multi-Step** - "School had 1,250 books. Bought 350 more, gave 175 away. How many now?"
  9. **Estimation** - "About how many if 2,847 on Saturday and 3,215 on Sunday?"

- **14 Contextual Themes** for variety:
  - Stickers, books, steps, points, apples, pencils, children, cars
  - Tickets, coins, flowers, stamps, marbles, badges
  - Each theme has: object, place, names, verbs

- **Operation Keywords** for highlighting:
  - Addition: more, total, altogether, combined, gained, bought, collected
  - Subtraction: left, remaining, difference, fewer, sold, lost, used, gave away
  - Compare: more than, less than, how many more, difference between
  - Question: How many, How much, What is, Find, Calculate, Estimate

**2. Word Problem Engine** (`expansion/js/problems/word-problem-engine.js` - 344 lines)

- **Problem Generation**:
  - `generateWordProblem(category, level, difficulty)` - Returns complete problem object
  - Uses level-based number ranges (matching Levels 2-5 from problem-generator)
  - Level 2: 10-99 (two-digit ± single-digit)
  - Level 3: 20-300 (two-digit ± two-digit)
  - Level 4: 100-999 (three-digit numbers)
  - Level 5: 1000-9999 (four-digit numbers)

- **Smart Number Selection**:
  - Compare problems: ensures n1 > n2
  - Change unknown: result bigger than start
  - Multi-step: appropriately sized intermediate values
  - Estimation: numbers close to round values with variance

- **Contextual Filling**:
  - Selects random theme and template
  - Fills placeholders: {name}, {n1}, {n2}, {object}, {place}, {pronoun}, {verb}
  - Gender-aware pronouns (he/she/they based on name)
  - Natural-sounding sentences

- **Answer Calculation**:
  - Determines correct operation based on category
  - Join result: addition (n1 + n2)
  - Separate result: subtraction (n1 - n2)
  - Change unknown: subtraction (n2 - n1)
  - Start unknown: addition (n1 + n2)
  - Multi-step: mixed operations (n1 + n2 - n3)

- **Scaffolding Generation**:
  - Level 1: Highlighted text (numbers blue, keywords green, questions yellow)
  - Level 2: Bar model data (part-whole, comparison, multi-step)
  - Level 3: Number sentence prompt with template

**3. Word Problem UI** (`expansion/js/problems/word-problem-ui.js` - 321 lines)

- **Problem Display**:
  - Large, readable text (1.35rem font)
  - Clean white card with shadow
  - Auto-focus on answer input

- **4-Level Scaffolding System**:

  **Level 1: Highlight Key Information** (toggle button)
  - Numbers highlighted in blue with background
  - Operation keywords in green ("more", "left", "total")
  - Question words in yellow ("How many", "Find")
  - Color legend shown below

  **Level 2: Show Bar Model** (toggle button)
  - Part-whole bar model for join/separate problems
  - Comparison bar model showing larger/smaller/difference
  - Multi-step bar model showing each operation
  - Visual bars scaled to numbers, color-coded
  - Unknown values marked with "?"

  **Level 3: Write Number Sentence** (toggle button)
  - Prompt: "Write this as a number sentence: ___ ○ ___ = ?"
  - Reveals correct number sentence (e.g., "347 + 256 = ?")
  - Helps translate words to math

  **Level 4: Solve** (automatic)
  - User enters answer
  - Check answer button
  - Instant feedback (✓ correct / ✗ incorrect with answer)

- **Scaffolding Tracking**:
  - Records highest level of scaffolding used per problem
  - Used buttons become disabled
  - Scaffolding level included in session results

- **Answer Submission**:
  - Number input (large, centered)
  - Enter key or button to submit
  - Correct: Green banner, 2s delay to next problem
  - Incorrect: Red banner with correct answer, hint (number sentence), 3s delay

- **Session Results Display**:
  - Large accuracy percentage
  - Correct/incorrect counts
  - Scaffolding usage breakdown:
    - No help needed
    - Highlighted
    - Bar model
    - Number sentence
  - Achievement banner if solved all without help: "🌟 Independent Solver!"

**4. Complete Styling** (`expansion/css/word-problems.css` - 542 lines)

**Problem Display**:
- White card, 2.5rem padding, rounded corners
- 1.35rem font, 1.8 line height for readability
- Box shadow for elevation

**Highlighting**:
- Numbers: Blue (#1976d2) with light blue background (#e3f2fd)
- Keywords: Green (#2e7d32) with light green background (#e8f5e9)
- Questions: Orange (#f57c00) with light orange background (#fff3e0)
- Legend with color samples

**Scaffolding Buttons**:
- Gray background container
- Three buttons: 🔍 Highlight, 📊 Bar Model, ✏️ Number Sentence
- Used buttons fade to 50% opacity
- Flex layout, wraps on mobile

**Bar Models**:
- Visual bars with borders, rounded corners
- Colored by type: whole (blue), part1 (green), part2 (orange)
- Comparison: larger (red), smaller (green), difference (yellow)
- Multi-step: shows operation symbols (+ / −) between bars
- Scaled to fit 400px width
- Labels inside bars

**Number Sentence Display**:
- Blue background prompt box
- Gray reveal box with large monospace font (2rem)
- Center-aligned

**Answer Input**:
- Large (1.75rem), centered, max-width 300px
- Blue focus border with shadow
- Disabled state after answering

**Feedback**:
- Correct: Green banner with ✓ icon
- Incorrect: Red banner with ✗ icon, shows correct answer
- Hint shown in smaller monospace font
- Pop-in animation (feedbackPop)

**Category Selection**:
- Grid layout (auto-fit, minmax 280px)
- Cards with header, name, difficulty badge, description
- Hover: blue border, lift effect
- Difficulty badges: easy (green), medium (orange), hard (red)

**Results Screen**:
- Large accuracy display
- Scaffolding stats in grid (4 columns)
- Gold gradient achievement banner
- Responsive: stacks on mobile

**Responsive Design**:
- Mobile: Single column, vertical buttons, smaller fonts
- Tablet: 2 columns
- Desktop: Full grid layout
- Touch devices: Larger tap targets

**5. Word Problems Screen** (Updated `expansion/js/expansion-app.js` - ~180 lines added)

**Category Selection Screen**:
- Grid of 9 category cards
- Each shows: name, difficulty badge, description, operation type
- Click to start 5-problem session

**Practice Screen**:
- Header: Category name, progress (Problem X / 5), end session button
- Word problem text
- Scaffolding buttons (highlight, bar model, number sentence)
- Scaffolding display area (hidden until button clicked)
- Answer input and check button
- Instant feedback
- Auto-advance after delay (2s correct, 3s incorrect)

**Results Screen**:
- Large accuracy percentage
- Correct/incorrect breakdown
- Scaffolding usage statistics
- Achievement banner if no help used
- Buttons: Practice same category, Try different category, Back to home

**State Management**:
```javascript
wordProblemsScreenState = {
  category: 'join_result_unknown',
  level: 3,
  difficulty: 'medium',
  currentProblem: { text, numbers, operation, answer, scaffolding, ... },
  problemSet: [ /* 5 problems */ ],
  currentIndex: 2,
  sessionResults: [
    { problem, userAnswer, correct, scaffoldingLevel, timestamp },
    // ...
  ],
  scaffoldingLevel: 1  // Highest level used for current problem
}
```

## User Flow

### Complete Word Problem Journey:
1. **Start**: Navigate to "Word Problems" from home
2. **Select Category**: Choose from 9 problem types (e.g., "Join Result Unknown")
3. **Practice Session**: 5 problems
   - Read word problem
   - Use scaffolding if needed:
     - Button 1: Highlight numbers and keywords
     - Button 2: Show bar model diagram
     - Button 3: Reveal number sentence
   - Enter answer
   - Get instant feedback
   - Auto-advance to next problem
4. **View Results**:
   - See accuracy and scaffolding usage
   - Get achievement if solved independently
   - Choose to practice again or try different category

## Pedagogical Impact

### Scaffolding Philosophy:
The layered scaffolding system provides **graduated support**:
- Students try independently first
- Request help only when stuck
- Different help levels for different struggles:
  - Can't find numbers? → Highlighting
  - Can't visualize? → Bar model
  - Can't translate to math? → Number sentence
- System tracks scaffolding usage to identify needs

### Students Can Now:
- ✅ **Read real-world problems** - Natural, contextual scenarios
- ✅ **Get targeted help** - Scaffolding matches their specific struggle
- ✅ **Visualize problems** - Bar models for part-whole and comparison
- ✅ **Translate to math** - See number sentence representation
- ✅ **Build independence** - Work towards solving without help
- ✅ **Practice variety** - 9 categories × 3-5 templates × 14 themes = hundreds of unique problems

### Teachers Gain:
- Scaffolding usage analytics (which helps are most needed)
- Category difficulty insights (which problem types struggle with)
- Independence progression (tracking decreasing scaffolding use)
- Comprehension vs calculation separation (scaffolding needed vs answer correct)

## Technical Implementation

### Architecture:
- **word-problem-templates.js**: Data layer - templates and themes
- **word-problem-engine.js**: Logic layer - generation and calculation
- **word-problem-ui.js**: Presentation layer - rendering and interaction
- **word-problems.css**: Style layer - visual design
- **expansion-app.js**: Integration layer - screen management and flow

### Template System:
```javascript
// Template with placeholders
"{name} had {n1} {object}. {pronoun} got {n2} more. How many {object} does {name} have now?"

// Theme data
{ object: "stickers", place: "collection", names: ["Sam", "Aisha"], verbs: { got: "received" } }

// Filled result
"Sam had 347 stickers. He received 256 more. How many stickers does Sam have now?"
```

### Bar Model Types:
1. **Part-Whole**: Two parts combine to make whole (join/separate)
2. **Comparison**: Shows larger, smaller, and difference (compare)
3. **Multi-Step**: Multiple operations shown sequentially

### Natural Language:
- Problems feel like real scenarios, not math exercises
- Variety in wording prevents pattern memorization
- Contextual themes keep problems engaging
- Pronouns match names for natural reading

## Files Created
1. `expansion/js/problems/word-problem-templates.js` (229 lines) - Templates and themes
2. `expansion/js/problems/word-problem-engine.js` (344 lines) - Generation logic
3. `expansion/js/problems/word-problem-ui.js` (321 lines) - Rendering and scaffolding
4. `expansion/css/word-problems.css` (542 lines) - Complete styling

## Files Modified
1. `expansion/js/expansion-app.js` (~180 lines added)
   - Added word problem imports
   - Added wordProblemsScreenState object
   - Added 'word-problems' case to switch
   - Added renderWordProblemsScreen with sub-screens
   - Added category selection, practice flow, results display
   - Added word-problems to home screen navigation
2. `expansion/expansion.html` - Added word-problems.css link, version → v2.15.0
3. `expansion/js/data/expansion-storage.js` - Version → 2.15.0

## Implementation Plan Progress
- ✅ Prompt 1-7: Core infrastructure, facts, diagnostics, remediation
- ✅ Prompt 8-9: Visual components (number line, ten frames, base-10, part-whole)
- ✅ Prompt 10-12: All 6 calculation methods
- ✅ Prompt 13: Method selection and comparison
- ✅ Prompt 14: Step display component
- ✅ Prompt 15: Multi-digit problem generator and practice levels
- ✅ Prompt 16: Word problem system with scaffolding
- ⏳ Prompt 17-20: Integration, polish, final features

## Next Steps (Prompt 17)
Potential directions:
- Integrate method selection into word problems (choose solving strategy)
- Add word problem diagnostic to detect comprehension misunderstandings
- Build mixed practice mode (facts + levels + word problems)
- Create teacher dashboard with detailed analytics
- Add custom word problem creator
- Implement full remediation for word problem comprehension errors

## Word Problem Categories Reference

| Category | Example | Operation | Difficulty |
|----------|---------|-----------|------------|
| Join (Result Unknown) | "Had 347, got 256 more. Total?" | Addition | Easy |
| Separate (Result Unknown) | "Had 503, sold 187. Left?" | Subtraction | Easy |
| Join (Change Unknown) | "Had 245, now 512. Added?" | Subtraction | Medium |
| Separate (Change Unknown) | "Had 500, now 312. Used?" | Subtraction | Medium |
| Separate (Start Unknown) | "28 left, 34 stayed. Started?" | Addition | Hard |
| Compare (Difference) | "A has 472, B has 319. More?" | Subtraction | Medium |
| Compare (Bigger Unknown) | "Tom 156, 89 more than Amy. Amy?" | Subtraction | Hard |
| Multi-Step | "Had 1250, bought 350, gave 175. Now?" | Mixed | Hard |
| Estimation | "About how many: 2847 + 3215?" | Addition | Medium |

## Notes
- Word problems use same level-based numbers as practice levels (Levels 2-5)
- Each session: 5 problems from same category
- Scaffolding tracking enables future adaptive help suggestions
- Templates designed to sound natural, not formulaic
- Themes provide cultural variety and engagement
- Bar models integrate with existing part-whole-model.js visual component

# Mental Math Expansion v2.9.0

**Release Date:** 2026-02-13
**Prompt:** 10 of 20

## New Features

### Calculation Methods System
First two mental math calculation methods for progressive number application:

**1. Partitioning Method** (`expansion/js/methods/partitioning.js` - 127 lines)
- Place value split strategy for multi-digit addition and subtraction
- Splits numbers into place values (hundreds, tens, ones), operates on each, then recombines
- Example: 347 + 256 → (300+200) + (40+50) + (7+6) → 500 + 90 + 13 → 603
- Functions:
  - `canApply(a, op, b)` - Returns true for 2+ digit numbers with + or -
  - `solve(a, op, b)` - Generates complete step-by-step solution with all intermediate steps
  - `getVisualData(a, op, b)` - Returns data for place value chart visualization
- Handles both addition and subtraction
- Supports 2-5 digit numbers
- Steps with 'input' field indicate user interaction points for guided mode

**2. Sequencing Method** (`expansion/js/methods/sequencing.js` - 141 lines)
- Left-to-right jump strategy using number line mental model
- Starts at first number, adds/subtracts place values one at a time
- Example: 347 + 256 → Start at 347 → +200 → 547 → +50 → 597 → +6 → 603
- Functions:
  - `canApply(a, op, b)` - Returns true for 2-4 digit numbers with + or -
  - `solve(a, op, b)` - Generates sequential steps with running totals
  - `getVisualData(a, op, b)` - Returns jump data for number line visualization
- Visual representation maps directly to number line jumps
- Forward jumps for addition, backward jumps for subtraction
- Maintains running total at each step

### Step-by-Step Solution Format
Both methods return structured solution objects:
```javascript
{
  method: 'partitioning' | 'sequencing',
  problem: '347 + 256',
  steps: [
    {
      description: 'Step description',
      detail: 'Detailed explanation',
      input: 500,  // Fields with 'input' are for user to fill in guided mode
      note: 'Optional additional explanation'
    }
  ],
  answer: 603
}
```

### Visual Integration
- Partitioning returns data for place value chart visual (to be implemented)
- Sequencing returns jump data compatible with existing NumberLineVisual
- Both methods designed to work with progressive number application UI

## Technical Details

### Implementation
- Pure JavaScript modules with named exports
- No dependencies - can be used standalone
- Handles edge cases (different digit counts, negative results in subtraction)
- Optimized to stay under 150 lines per file

### Files Created
1. `expansion/js/methods/partitioning.js` (127 lines)
2. `expansion/js/methods/sequencing.js` (141 lines)

### Files Modified
1. `expansion/expansion.html` - Version updated to v2.9.0
2. `expansion/js/data/expansion-storage.js` - Version updated to 2.9.0

## Implementation Plan Progress
- ✅ Prompt 1-7: Core infrastructure, facts, diagnostics, remediation
- ✅ Prompt 8-9: Visual components (number line, ten frames, base-10, part-whole)
- ✅ Prompt 10: First two calculation methods (partitioning, sequencing)
- ⏳ Prompt 11-20: Remaining methods, progressive application UI, polish

## Next Steps (Prompt 11)
- Build remaining calculation methods (compensation, same difference, column, counting on)
- Create method comparison UI
- Integrate methods with progressive number application screens

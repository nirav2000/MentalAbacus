# Mental Math Expansion v2.10.0

**Release Date:** 2026-02-13
**Prompt:** 11 of 20

## New Features

### Calculation Methods System - Methods 3 & 4
Two additional mental math calculation methods for progressive number application:

**1. Compensation Method** (`expansion/js/methods/compensation.js` - 129 lines)
- **Strategy**: Round and Adjust - rounds one number to a nearby round number for easier calculation, then adjusts the result
- **Best For**: When one number is close to a round number (within 20 of a multiple of 10, 100, 1000, etc.)
- **Example**: 347 + 298
  - Identify: 298 is close to 300 (2 away)
  - Calculate: 347 + 300 = 647
  - Adjust: We added 2 too many → 647 - 2 = 645
- **Functions**:
  - `canApply(a, op, b)` - Returns true when at least one number is within 20 of a round number
  - `findRoundingTarget(n)` - Finds nearest round number and calculates adjustment needed
  - `solve(a, op, b)` - Generates complete step-by-step solution with adjustment explanations
  - `getVisualData(a, op, b)` - Returns data for number line visualization
- **Critical Feature**: Clear explanation of adjustment direction:
  - Addition + rounded UP → subtract the extra
  - Addition + rounded DOWN → add the shortfall
  - Subtraction + rounded UP subtrahend → add back (subtracted too much)
  - Subtraction + rounded DOWN subtrahend → subtract more
- Works for both addition and subtraction

**2. Same Difference Method** (`expansion/js/methods/same-difference.js` - 140 lines)
- **Strategy**: For subtraction only - adds the same amount to both numbers to make subtraction easier
- **Key Concept**: The difference between two numbers stays the same when you shift both by the same amount
- **Best For**: Subtraction where subtrahend is near a round number (within 20)
- **Example**: 503 - 187
  - Goal: Make 187 into a round number
  - Adjustment: Add 13 to both (187 + 13 = 200)
  - New problem: 516 - 200
  - Easy subtraction: 516 - 200 = 316
  - Why it works: The gap between numbers stays the same if you shift both equally
- **Functions**:
  - `canApply(a, op, b)` - Returns true for subtraction when subtrahend is within 20 of a round number
  - `solve(a, op, b)` - Generates steps with clear explanation of why same difference works
  - `getVisualData(a, op, b)` - Returns data for bar model visualization
- Includes pedagogical explanation of the mathematical principle

### Solution Format
Both methods follow the established pattern:
```javascript
{
  method: 'compensation' | 'same_difference',
  problem: '347 + 298',
  steps: [
    {
      description: 'Step description',
      detail: 'Detailed calculation',
      input: 647,  // User interaction point
      note: 'Explanatory note about why/how'
    }
  ],
  answer: 645
}
```

### Visual Integration
- Compensation returns data for number line visual showing the round-then-adjust process
- Same difference returns data for bar model showing the equal shift concept

## Technical Details

### Implementation
- Pure JavaScript modules with named exports
- Automatic detection of best rounding target (tries bases 10, 100, 1000, 10000)
- Smart selection of which operand to round (chooses the one closer to a round number)
- Clear pedagogical notes explaining the mathematical reasoning
- Optimized to stay under 150 lines per file

### Files Created
1. `expansion/js/methods/compensation.js` (129 lines)
2. `expansion/js/methods/same-difference.js` (140 lines)

### Files Modified
1. `expansion/expansion.html` - Version updated to v2.10.0
2. `expansion/js/data/expansion-storage.js` - Version updated to 2.10.0

## Method Comparison

The expansion module now includes 4 complete calculation methods:
1. **Partitioning** - Split into place values, operate separately, recombine
2. **Sequencing** - Start at one number, add/subtract place values sequentially
3. **Compensation** - Round to easier number, then adjust
4. **Same Difference** - (Subtraction only) Shift both numbers to make subtraction easier

Each method has different strengths and is appropriate for different problem types.

## Implementation Plan Progress
- ✅ Prompt 1-7: Core infrastructure, facts, diagnostics, remediation
- ✅ Prompt 8-9: Visual components (number line, ten frames, base-10, part-whole)
- ✅ Prompt 10: First two calculation methods (partitioning, sequencing)
- ✅ Prompt 11: Additional calculation methods (compensation, same difference)
- ⏳ Prompt 12-20: Remaining methods, progressive application UI, integration, polish

## Next Steps (Prompt 12)
- Build remaining calculation methods (column method, counting on)
- Create method selection and comparison UI
- Integrate all methods with progressive number application screens
- Add method recommendation engine

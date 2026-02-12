# Mental Math App Expansion Plan

## Addition & Subtraction Facts + Progressive Number Sense Application

> **Purpose**: This document is a comprehensive implementation plan for Claude Code. It extends the existing mental math app (which covers multiplication/division facts and basic number sense) to include addition/subtraction fact fluency AND a progression system that takes users from foundational number sense all the way to solving multi-digit and word problems using selectable mental math strategies.

-----

## TABLE OF CONTENTS

1. [Architecture Overview](#1-architecture-overview)
1. [Module A: Addition & Subtraction Facts](#2-module-a-addition--subtraction-facts)
1. [Module B: Progressive Number Application](#3-module-b-progressive-number-application)
1. [Top 10 Misunderstandings & Mistakes](#4-top-10-misunderstandings--mistakes)
1. [Diagnostic & Remediation Engine](#5-diagnostic--remediation-engine)
1. [Visual & Pictorial Illustration System](#6-visual--pictorial-illustration-system)
1. [Method Selection & Multi-Strategy System](#7-method-selection--multi-strategy-system)
1. [Intermediate Step Display System](#8-intermediate-step-display-system)
1. [Word Problem Engine](#9-word-problem-engine)
1. [Data Model & Progression Logic](#10-data-model--progression-logic)
1. [UI/UX Specifications](#11-uiux-specifications)
1. [Implementation Order & File Structure](#12-implementation-order--file-structure)

-----

## 1. ARCHITECTURE OVERVIEW

### Design Principles

- **ES6 Modular Architecture**: Each feature area is a separate JS module (100–150 lines max per file)
- **Incremental Mastery**: No topic unlocks until prerequisites are demonstrated
- **Show Your Working**: Every strategy/method displays all intermediate steps so the user can follow the logic
- **Diagnose Before Drill**: The app identifies *what* is misunderstood before prescribing practice
- **Multiple Strategies**: For any given problem, the user can see and select from multiple valid methods
- **Visual First**: Every concept has a pictorial/illustration mode for concrete understanding before abstract practice

### Integration with Existing App

This expansion sits alongside the existing multiplication/division and number sense modules. Shared systems:

- Adaptive difficulty engine (time + accuracy metrics)
- Firebase-compatible data layer with localStorage fallback
- Session logging and progress tracking
- Progress dashboard and stats view
- Colour-coded feedback system

-----

## 2. MODULE A: ADDITION & SUBTRACTION FACTS

### 2.1 Scope

Mastery of all addition facts (0+0 through 12+12) and subtraction facts (0-0 through 24-12), with automatic inverse linking (if you know 7+5=12, you should know 12-5=7).

### 2.2 Strategy-Based Fact Families

Each fact is taught through a specific strategy. The app groups facts by the strategy used to derive them:

#### Addition Strategies (in teaching order)

|# |Strategy                            |Facts Covered                          |Example                          |
|--|------------------------------------|---------------------------------------|---------------------------------|
|1 |**Counting On +1, +2, +3**          |n+1, n+2, n+3 for all n                |7+2 → “start at 7, count 8, 9”   |
|2 |**Doubles**                         |n+n for n=0–12                         |6+6=12                           |
|3 |**Doubles +1 / -1**                 |n+n+1, n+n-1                           |6+7 → “6+6=12, plus 1 = 13”      |
|4 |**Doubles +2 / -2**                 |n+n+2, n+n-2                           |6+8 → “7+7=14” or “6+6=12, +2=14”|
|5 |**Making 10**                       |Pairs that sum to 10                   |7+3=10, 8+2=10                   |
|6 |**Adding to 10 (Bridge through 10)**|Single digit + single digit crossing 10|8+5 → “8+2=10, 10+3=13”          |
|7 |**Commutative Swap**                |If a+b is hard, try b+a                |3+9 → think “9+3”                |
|8 |**Adding 10**                       |n+10 for all n                         |7+10=17                          |
|9 |**Adding 9 (add 10 subtract 1)**    |n+9 for all n                          |7+9 → “7+10=17, 17-1=16”         |
|10|**Adding 0**                        |n+0 identity                           |5+0=5                            |

#### Subtraction Strategies (in teaching order)

|# |Strategy                             |Facts Covered                         |Example                      |
|--|-------------------------------------|--------------------------------------|-----------------------------|
|1 |**Counting Back -1, -2, -3**         |n-1, n-2, n-3                         |9-2 → “9, 8, 7”              |
|2 |**Subtracting 0**                    |n-0 identity                          |7-0=7                        |
|3 |**Think Addition (Inverse)**         |All facts via a+?=b                   |13-5 → “5+?=13, 5+8=13, so 8”|
|4 |**Doubles Subtraction**              |2n - n = n                            |14-7=7 (because 7+7=14)      |
|5 |**Subtract from 10**                 |10-n for n=0–10                       |10-6=4                       |
|6 |**Bridge Back Through 10**           |Teen number - single digit crossing 10|13-5 → “13-3=10, 10-2=8”     |
|7 |**Subtracting 10**                   |n-10                                  |17-10=7                      |
|8 |**Subtracting 9 (subtract 10 add 1)**|n-9                                   |16-9 → “16-10=6, 6+1=7”      |
|9 |**Compensation**                     |Adjust to easier number               |15-8 → “15-10=5, 5+2=7”      |
|10|**Same Difference**                  |Adjust both numbers equally           |83-47 → “86-50=36”           |

### 2.3 Fact Mastery Tracking

For each of the 169 addition facts (0–12 × 0–12) and corresponding subtraction facts:

```javascript
factMastery: {
  "7+5": {
    strategy: "bridge_through_10",
    attempts: 14,
    correct: 12,
    averageTimeMs: 2800,
    lastSeen: "2026-02-10",
    masteryLevel: "fluent",    // learning | developing | secure | fluent
    linkedFacts: ["5+7", "12-5", "12-7"],
    mistakeHistory: ["answered_11", "answered_11", "answered_13"]
  }
}
```

**Mastery Levels**:

- **Learning**: < 60% accuracy OR > 10s response time
- **Developing**: 60–79% accuracy OR 5–10s response time
- **Secure**: 80–94% accuracy AND 3–5s response time
- **Fluent**: 95%+ accuracy AND < 3s response time

### 2.4 Progression Rules

1. User starts a diagnostic quiz covering all strategy groups (5 questions each)
1. Results identify which strategies are already known vs need teaching
1. Strategies are taught in order — the user cannot skip ahead
1. A strategy is “complete” when 90% of its facts reach “Secure” or above
1. Periodic mixed review pulls from all learned strategies to maintain fluency
1. Inverse linking: if addition fact reaches “Fluent”, automatically test the subtraction inverse

-----

## 3. MODULE B: PROGRESSIVE NUMBER APPLICATION

### 3.1 Overview

This module takes the foundational facts and strategies from Module A (and the existing multiplication/division module) and applies them to progressively larger and more complex problems. The goal is to demonstrate that **big number arithmetic is just small number arithmetic applied systematically**.

### 3.2 Progression Levels

```
Level 1: Single-digit (1–9) ← Facts from Module A
Level 2: Two-digit ± single-digit (e.g. 34 + 7, 52 - 8)
Level 3: Two-digit ± two-digit (e.g. 47 + 35, 82 - 46)
Level 4: Three-digit ± two/three-digit (e.g. 347 + 256, 503 - 187)
Level 5: Four-digit and beyond (e.g. 4,372 + 1,859)
Level 6: Mixed operations and multi-step (e.g. 347 + 256 - 189)
Level 7: Word problems using any of the above
```

### 3.3 Mental Math Methods for Larger Numbers

Each method must display ALL intermediate steps. The user can select which method to use or see all of them.

#### METHOD 1: Partitioning (Place Value Split)

```
347 + 256
Step 1: Split into place values
        300 + 40 + 7
      + 200 + 50 + 6
Step 2: Add each column
        Hundreds: 300 + 200 = 500
        Tens:      40 +  50 =  90
        Ones:       7 +   6 =  13
Step 3: Recombine
        500 + 90 + 13 = 603
```

#### METHOD 2: Sequencing (Left to Right / Jump Strategy)

```
347 + 256
Step 1: Start with 347
Step 2: + 200 → 547     (add hundreds)
Step 3: + 50  → 597     (add tens)
Step 4: + 6   → 603     (add ones)
Answer: 603
```

Visual: Number line showing each jump.

#### METHOD 3: Compensation (Round and Adjust)

```
347 + 298
Step 1: 298 is close to 300
Step 2: 347 + 300 = 647  (easier sum)
Step 3: But we added 2 too many
Step 4: 647 - 2 = 645
Answer: 645
```

#### METHOD 4: Same Difference (for Subtraction)

```
503 - 187
Step 1: Add 13 to both numbers (to make subtrahend a round number)
Step 2: 516 - 200 = 316
Answer: 316
Why: The difference stays the same when you add/subtract the same amount from both
```

#### METHOD 5: Column Method (Traditional Written)

```
  347
+ 256
-----
Step 1: Ones: 7 + 6 = 13, write 3 carry 1
Step 2: Tens: 4 + 5 + 1(carry) = 10, write 0 carry 1
Step 3: Hundreds: 3 + 2 + 1(carry) = 6
Answer: 603
```

#### METHOD 6: Counting On (for small differences in subtraction)

```
503 - 496
Step 1: Count up from 496
        496 → 500 (+4)
        500 → 503 (+3)
Step 2: 4 + 3 = 7
Answer: 7
```

#### METHOD 7: Number Line / Bar Model

Visual representation of any of the above methods on a number line, showing the jumps, partitions, or adjustments as visual segments.

### 3.4 Method Selection UI

When presented with a problem, the user sees:

1. The problem (e.g. “347 + 256”)
1. A “Choose your method” panel showing available methods as clickable cards
1. Each card shows a brief label and one-line description:
- 🧩 **Partitioning** — “Split numbers by place value”
- ➡️ **Sequencing** — “Add in steps from left to right”
- 🔄 **Compensation** — “Round to an easier number, then adjust”
- ⚖️ **Same Difference** — “Shift both numbers to make it easier”
- 📝 **Column Method** — “Traditional written method”
- 🔢 **Counting On** — “Count up from one number to the other”
1. After the user solves it, they can click “Show Other Methods” to see alternative approaches
1. A “Which was fastest?” reflection prompt encourages metacognition

### 3.5 Adaptive Method Recommendations

The app tracks which methods the user is most accurate/fastest with and:

- Suggests their strongest method for timed challenges
- Recommends practising weaker methods during training mode
- For each problem, highlights which method is typically most efficient (e.g. compensation for near-round numbers, counting on for close numbers)

-----

## 4. TOP 10 MISUNDERSTANDINGS & MISTAKES

### 4.1 Addition — Top 10 Misunderstandings

|# |Misunderstanding                                |Example of Error                                                                  |Root Cause                                                   |Diagnostic Question                                                                    |
|--|------------------------------------------------|----------------------------------------------------------------------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------|
|1 |**Counting includes the start number**          |7+3: counts “7,8,9” → 9 instead of 10                                             |Doesn’t understand “counting on” means starting AFTER        |“Start at 7. Count on 3 more. What numbers do you say?”                                |
|2 |**Place value confusion in carrying**           |47+35: writes 712 (7+5=12, 4+3=7)                                                 |Doesn’t understand that the 1 in 12 represents 10, not 1     |“In the number 12, what does the 1 mean?”                                              |
|3 |**Always adds left to right without regrouping**|48+37: gets 75 (4+3=7, 8+7=15, drop the 1)                                        |Procedural error — forgets to carry or doesn’t know when to  |“What happens when ones add up to more than 9?”                                        |
|4 |**Doesn’t understand commutativity**            |Knows 9+3=12 but can’t quickly solve 3+9                                          |Treats 3+9 as a different, unlearned fact                    |“Is 3+9 the same as 9+3? Why?”                                                         |
|5 |**Adds digits independently across a number**   |23+45 → 2+4=6, 3+5=8, answer: 68 (correct by luck) but 27+45 → 2+4=6, 7+5=12 → 612|Doesn’t understand place value carrying                      |“What is 27+45? Show me your steps.”                                                   |
|6 |**Confuses addition with multiplication**       |Sees 6+6 and answers 36 (thinking 6×6)                                            |Strategy interference, especially after learning times tables|Mixed operation drill: “6+6=? 6×6=?”                                                   |
|7 |**Bridge through 10 errors**                    |8+5: “8+2=10, then…3? 4?” — loses track of remainder                              |Can split to 10 but loses the leftover part                  |“8+5: You need 2 to make 10. How many are left from the 5?”                            |
|8 |**Zero misconception**                          |Thinks 5+0=0 or is unsure                                                         |Conflates “adding nothing” with “the answer is nothing”      |“I have 5 sweets. I get 0 more. How many do I have?”                                   |
|9 |**Misaligns columns in written addition**       |347+52 written as 347+520 because digits aren’t aligned right                     |Doesn’t understand place value alignment                     |Show 347+52 written both correctly and incorrectly, ask which is right                 |
|10|**Overgeneralises compensation**                |45+28: rounds 28→30, does 45+30=75, then adds 2 instead of subtracting → 77       |Doesn’t understand whether to add or subtract the adjustment |“You added 2 extra to 28 to make 30. Should you add or subtract 2 from the total? Why?”|

### 4.2 Subtraction — Top 10 Misunderstandings

|# |Misunderstanding                                        |Example of Error                                               |Root Cause                                                    |Diagnostic Question                                                    |
|--|--------------------------------------------------------|---------------------------------------------------------------|--------------------------------------------------------------|-----------------------------------------------------------------------|
|1 |**Always subtracts smaller digit from larger**          |42-17: does 4-1=3, 7-2=5 → 35                                  |Doesn’t understand regrouping/borrowing                       |“What is 42-17? Show steps.”                                           |
|2 |**Borrowing confusion — forgets to reduce**             |503-287: borrows from 5 to make ones 13, but leaves the 5 as 5 |Procedural gap in multi-step borrowing                        |“After you borrow from the tens, what happens to the tens digit?”      |
|3 |**Borrowing across zero**                               |400-156: can’t borrow from 0 in tens column                    |Doesn’t know to chain-borrow from hundreds through tens       |“How do you borrow when the next column is 0?”                         |
|4 |**Subtraction is not commutative but treats it as such**|Thinks 5-3 = 3-5 = 2                                           |Doesn’t understand order matters                              |“Is 5-3 the same as 3-5?”                                              |
|5 |**Negative number confusion**                           |3-7: writes 4 (reverses to 7-3)                                |Avoids negative results by swapping                           |“What is 3-7? Is it possible? What does it mean?”                      |
|6 |**Counting back includes start number**                 |10-3: counts “10, 9, 8” → 8 instead of 7                       |Same counting error as addition                               |“Count back 3 from 10. What numbers do you say?”                       |
|7 |**Subtracting from 10/100/1000 errors**                 |1000-467: various errors in chain borrowing                    |Multiple conceptual gaps compounding                          |Staged: “10-7=? 100-67=? 1000-467=?”                                   |
|8 |**Think-addition fails when facts aren’t fluent**       |15-8: tries “8+?=15” but can’t recall, guesses                 |Addition fact fluency is a prerequisite                       |Test the inverse addition fact first                                   |
|9 |**Compensation direction reversed**                     |63-29: does 63-30=33, then subtracts 1 → 32 instead of adding 1|Confused about adjustment direction                           |“You subtracted 1 extra. Do you need to put it back or take more away?”|
|10|**Misreads subtraction as addition**                    |74-38: answers 112                                             |Inattention or sign confusion, often in mixed operation drills|Highlight the operation sign. “What does this symbol tell you to do?”  |

### 4.3 Larger Numbers — Top 10 Misunderstandings

|# |Misunderstanding                               |Example of Error                                                                              |Root Cause                                     |Diagnostic Question                                      |
|--|-----------------------------------------------|----------------------------------------------------------------------------------------------|-----------------------------------------------|---------------------------------------------------------|
|1 |**Place value misunderstanding**               |Thinks the 4 in 4,372 is worth 4, not 4,000                                                   |Weak place value foundation                    |“What is the value of the 4 in 4,372?”                   |
|2 |**Column misalignment**                        |Adds 4372+59 as 4372+5900                                                                     |Doesn’t right-align numbers                    |“Where does the 59 go when you line it up under 4372?”   |
|3 |**Carrying across multiple columns**           |4,897+3,654: errors cascade across columns                                                    |Single carrying is OK but chaining fails       |Two-column carry first, then three, then four            |
|4 |**Partitioning errors with big numbers**       |4,372 → “4+3+7+2” instead of “4000+300+70+2”                                                  |Place value not connected to partitioning      |“Partition 4,372 into thousands, hundreds, tens and ones”|
|5 |**Sequencing/jump errors with big numbers**    |Gets lost in multi-step jumps on a number line                                                |Working memory overload                        |Reduce number of jumps; write each step down             |
|6 |**Compensation adjustment size errors**        |2,997+1,456: rounds to 3,000 (adds 3) but adjusts by 30 or 300                                |Confused about how much was added when rounding|“2,997 to 3,000 — how much did you add?”                 |
|7 |**Reading/writing large numbers**              |Reads 30,042 as “thirty thousand and forty-two” but writes it as 3042                         |Disconnect between verbal and written forms    |“Write ‘thirty thousand and forty-two’ as a number”      |
|8 |**Forgetting to include zeros as placeholders**|4,000+300+2 = 432 instead of 4,302                                                            |Drops the zero placeholder                     |“What goes in the tens place in 4,302?”                  |
|9 |**Estimating before solving**                  |Can’t tell if 347+256 should be roughly 600                                                   |Doesn’t use rounding as a reasonableness check |“Without calculating, roughly what should 347+256 be?”   |
|10|**Choosing an inappropriate method**           |Uses column method for 1000-1 (should be instant) or tries mental partitioning for 4,897+3,654|Lack of method selection awareness             |“What’s the quickest way to solve this? Why?”            |

-----

## 5. DIAGNOSTIC & REMEDIATION ENGINE

### 5.1 Diagnostic Flow

```
START
  │
  ▼
┌─────────────────────────────┐
│  Quick Diagnostic Quiz       │
│  (5 questions per strategy   │
│   group, timed)              │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Analyse Results             │
│  - Accuracy per strategy     │
│  - Time per strategy         │
│  - Error pattern detection   │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Identify Misunderstandings  │
│  - Match errors to Top 10    │
│  - Flag root causes          │
│  - Check prerequisites       │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│  Generate Learning Path      │
│  - Prioritise prerequisites  │
│  - Assign remediation units  │
│  - Schedule re-assessment    │
└─────────────────────────────┘
```

### 5.2 Error Pattern Detection

```javascript
// Error pattern matching rules
const errorPatterns = {
  "smaller_from_larger": {
    // User always subtracts smaller digit from larger regardless of position
    detect: (problem, userAnswer, correctAnswer) => {
      // e.g., 42-17: user answered 35 (4-1=3, 7-2=5)
      const digits = analyseDigitPairs(problem);
      return digits.every(([top, bottom]) => 
        Math.abs(top - bottom) === parseInt(getUserDigit(userAnswer, position))
      );
    },
    misunderstanding: "always_subtracts_smaller_from_larger",
    remediation: "regrouping_unit"
  },
  "off_by_one_counting": {
    detect: (problem, userAnswer, correctAnswer) => {
      return Math.abs(userAnswer - correctAnswer) === 1;
    },
    misunderstanding: "counting_includes_start",
    remediation: "counting_on_unit"
  },
  // ... more patterns
};
```

### 5.3 Remediation Unit Structure

Each remediation unit follows this sequence:

```
1. ILLUSTRATE: Visual/pictorial explanation of the concept
   - Concrete manipulatives (blocks, counters, number line)
   - Animation showing the concept step by step

2. EXPLAIN: Short, clear text explanation
   - Maximum 3 sentences
   - Highlights the specific misconception and corrects it
   - Uses "You might have thought X, but actually Y because Z"

3. GUIDED PRACTICE: Incremental sums with full working shown
   - Start with the simplest possible version of the concept
   - Each step builds ONE new element
   - User completes each sub-step individually
   - Immediate feedback with visual support

4. INDEPENDENT PRACTICE: Gradually remove scaffolding
   - Same problem types but without step-by-step breakdown
   - Still show intermediate steps in review if incorrect

5. CHECK: Re-assess the specific misunderstanding
   - 5 questions targeting exactly this misconception
   - Must achieve 80% to proceed
   - If failed, loop back to step 1 with different examples
```

### 5.4 Incremental Sum Breakdown Example

**Target**: User doesn’t understand borrowing/regrouping in subtraction

```
Incremental Sequence:
━━━━━━━━━━━━━━━━━━━━

Step 1: No borrowing needed
  "15 - 3 = ?"                    (ones subtraction, no borrow)

Step 2: Borrowing concept with manipulatives  
  [VISUAL: 1 ten-rod and 5 unit cubes]
  "You have 15. That's 1 ten and 5 ones."
  "Can you take 8 ones away from 5 ones?"
  → User answers No
  "Right! We need to break the ten into ones."
  [ANIMATION: ten-rod breaks into 10 unit cubes]
  "Now you have 0 tens and 15 ones. Take away 8."
  "15 - 8 = ?"

Step 3: Written form of what just happened
  "  15       →      0  15  "
  "- 8              -    8  "
  "----             ------  "
  "                     7   "
  "The 1 ten became 10 ones. 10+5=15 ones. 15-8=7."

Step 4: Two-digit minus one-digit WITH borrowing  
  "32 - 7 = ?"
  Sub-step A: "Can you take 7 from 2?"  → No
  Sub-step B: "Borrow 1 ten. Tens: 3→2. Ones: 2→12"
  Sub-step C: "12 - 7 = ?"  → 5
  Sub-step D: "Tens digit is now 2. Answer: 25"

Step 5: Two-digit minus two-digit WITH borrowing
  "42 - 17 = ?"
  Sub-step A: "Ones: 2-7. Can you do this?" → No
  Sub-step B: "Borrow. Tens: 4→3. Ones: 2→12"  
  Sub-step C: "12 - 7 = ?" → 5
  Sub-step D: "3 - 1 = ?" → 2
  Sub-step E: "Answer: 25"

Step 6: Same problem without sub-step prompts
  "53 - 28 = ?"
  (User enters 25. Correct!)

Step 7: Problem with carrying in addition for contrast
  "47 + 35 = ?"
  (Tests that borrowing knowledge hasn't broken addition understanding)
```

-----

## 6. VISUAL & PICTORIAL ILLUSTRATION SYSTEM

### 6.1 Visual Types

Each concept has associated visuals. These are rendered using HTML5 Canvas or SVG, not external images.

|Visual Type          |Used For                                         |Description                                                                        |
|---------------------|-------------------------------------------------|-----------------------------------------------------------------------------------|
|**Base-10 Blocks**   |Place value, regrouping                          |Thousands cubes, hundreds flats, tens rods, ones units. Animate breaking/combining.|
|**Number Line**      |Counting on/back, sequencing, jumps, compensation|Horizontal line with tick marks. Animated arcs showing jumps. Labels on each arc.  |
|**Part-Whole Model** |Fact families, making 10, partitioning           |Circle at top, two circles below. Shows how a number splits into parts.            |
|**Bar Model**        |Comparison, word problems, same difference       |Rectangular bars of proportional length. Labelled sections.                        |
|**Ten Frames**       |Making 10, number bonds, addition to 20          |2×5 grid with filled/empty dots.                                                   |
|**Place Value Chart**|Column alignment, partitioning, carrying         |Th                                                                                 |
|**Counters / Dots**  |Concrete counting, grouping                      |Coloured circles that can be grouped, moved, crossed out.                          |
|**Balance Scale**    |Equals sign meaning, commutativity, equations    |Two pans showing equivalence.                                                      |

### 6.2 Implementation Approach

```javascript
// Visual component interface
class MathVisual {
  constructor(canvas, type, options) { }
  
  // Animate a step-by-step explanation
  async animateSteps(steps) { }
  
  // Render a static state
  render(state) { }
  
  // Allow user interaction (drag counters, draw on number line)
  enableInteraction(onComplete) { }
}

// Example: Number line for 347 + 256 using sequencing
const visual = new MathVisual(canvas, 'numberLine', {
  min: 300,
  max: 650,
  start: 347
});

await visual.animateSteps([
  { jump: 200, label: "+200", land: 547 },
  { jump: 50,  label: "+50",  land: 597 },
  { jump: 6,   label: "+6",   land: 603 }
]);
```

### 6.3 When Visuals Are Shown

- **Always** during remediation units (mandatory)
- **On request** during normal practice (tap “Show me” button)
- **Automatically** after 2 consecutive wrong answers on same concept
- **As celebration** — animated visual when mastering a strategy group

-----

## 7. METHOD SELECTION & MULTI-STRATEGY SYSTEM

### 7.1 Core Feature: “Solve It Your Way”

For every problem at Level 2+ (two-digit and above), the app offers:

1. **Free Solve**: User solves it however they want, enters answer
1. **Choose a Method**: User picks from available method cards, then the app guides them through that method’s steps
1. **Show All Methods**: After solving, user can tap to see how the problem would be solved by every applicable method
1. **Compare Methods**: Side-by-side view showing the same problem solved 2–3 different ways, with step counts and a “Which do you prefer?” prompt

### 7.2 Method Applicability Rules

Not every method suits every problem. The app determines which methods to offer:

```javascript
const methodApplicability = {
  partitioning: {
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 5,
    bestWhen: 'general purpose, no rounding needed'
  },
  sequencing: {
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 4,
    bestWhen: 'one number is much smaller or simpler'
  },
  compensation: {
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 5,
    bestWhen: (a, b) => nearRoundNumber(a) || nearRoundNumber(b),
    // e.g., 298, 499, 1001
  },
  sameDifference: {
    operations: ['subtraction'],
    minDigits: 2,
    maxDigits: 5,
    bestWhen: (a, b) => nearRoundNumber(b),
    // Makes subtrahend a round number
  },
  columnMethod: {
    operations: ['addition', 'subtraction'],
    minDigits: 2,
    maxDigits: 99,
    bestWhen: 'always available as written fallback'
  },
  countingOn: {
    operations: ['subtraction'],
    minDigits: 2,
    maxDigits: 4,
    bestWhen: (a, b) => Math.abs(a - b) < 20,
    // Numbers are close together
  }
};
```

### 7.3 Method Mastery Tracking

```javascript
methodMastery: {
  "partitioning": {
    timesUsed: 24,
    accuracy: 0.88,
    avgTimeMs: 14000,
    comfortLevel: "confident",  // novice | practising | confident | expert
    lastUsed: "2026-02-10"
  },
  // ... for each method
}
```

### 7.4 “Method of the Day” Feature

Each practice session introduces or highlights one method. The app:

1. Explains the method with a visual example
1. Gives 5 guided practice problems using that method
1. Gives 5 independent practice problems
1. Shows how the same problems could be solved with a previously learned method
1. Asks the user to reflect: “Which method did you find easier for these problems?”

-----

## 8. INTERMEDIATE STEP DISPLAY SYSTEM

### 8.1 Core Requirement

**Every method MUST show all intermediate steps so the user never wonders “where did that number come from?”**

### 8.2 Step Display Format

```
┌─────────────────────────────────────┐
│  347 + 256                          │
│                                     │
│  Method: Partitioning               │
│  ─────────────────                  │
│                                     │
│  Step 1 of 3: Split into place      │
│  values                             │
│  ┌───────────────────────────────┐  │
│  │ 347 = 300 + 40 + 7           │  │
│  │ 256 = 200 + 50 + 6           │  │
│  └───────────────────────────────┘  │
│                                     │
│  Step 2 of 3: Add each place value  │
│  ┌───────────────────────────────┐  │
│  │ Hundreds: 300 + 200 = 500    │  │
│  │ Tens:      40 +  50 =  90   │  │
│  │ Ones:       7 +   6 =  13   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Step 3 of 3: Combine               │
│  ┌───────────────────────────────┐  │
│  │ 500 + 90 + 13 = 603          │  │
│  │ (Note: 90 + 13 = 103,        │  │
│  │  then 500 + 103 = 603)       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ✅ Answer: 603                     │
└─────────────────────────────────────┘
```

### 8.3 Interactive Steps Mode

In “Choose a Method” mode, the user is prompted to complete each sub-step:

```
Step 1: Split 347 into place values
  Hundreds: [____]  (user types 300)  ✅
  Tens:     [____]  (user types 40)   ✅
  Ones:     [____]  (user types 7)    ✅

Step 2: Now split 256
  Hundreds: [____]  (user types 200)  ✅
  Tens:     [____]  (user types 50)   ✅
  Ones:     [____]  (user types 6)    ✅

Step 3: Add the hundreds
  300 + 200 = [____]  (user types 500)  ✅

Step 4: Add the tens
  40 + 50 = [____]  (user types 90)  ✅

Step 5: Add the ones
  7 + 6 = [____]  (user types 13)  ✅

Step 6: Combine all parts
  500 + 90 + 13 = [____]  (user types 603)  ✅

🎉 Correct! Well done!
```

If the user gets a sub-step wrong, the app provides immediate correction with a mini-visual before continuing.

-----

## 9. WORD PROBLEM ENGINE

### 9.1 Problem Categories

|Category                     |Example                                                                                     |Key Skill                       |
|-----------------------------|--------------------------------------------------------------------------------------------|--------------------------------|
|**Join (Result Unknown)**    |“Sam had 347 stickers. He got 256 more. How many now?”                                      |Addition                        |
|**Separate (Result Unknown)**|“A shop had 503 apples. 187 were sold. How many left?”                                      |Subtraction                     |
|**Join (Change Unknown)**    |“Mia had 245 beads. After buying more, she had 512. How many did she buy?”                  |Subtraction (to find difference)|
|**Separate (Start Unknown)** |“Some children were on a bus. 28 got off. Now there are 34. How many were on at first?”     |Addition (reverse thinking)     |
|**Compare (Difference)**     |“Class A raised £472. Class B raised £319. How much more did Class A raise?”                |Subtraction                     |
|**Compare (Bigger Unknown)** |“Tom has 156 cards. He has 89 more than Amy. How many does Amy have?”                       |Subtraction                     |
|**Multi-Step**               |“A school had 1,250 books. They bought 350 more and then gave 175 to charity. How many now?”|Mixed operations                |
|**Estimation First**         |“About how many people visited the museum if 2,847 came on Saturday and 3,215 on Sunday?”   |Rounding + Addition             |

### 9.2 Word Problem Scaffolding

For each word problem, the app provides layered scaffolding (shown on request or after errors):

**Level 1 — Highlight Key Information**

- Numbers highlighted in blue
- Operation keywords highlighted in green (“more”, “left”, “difference”, “total”)
- Question highlighted in yellow

**Level 2 — Bar Model Representation**

- Auto-generate a bar model diagram from the problem
- User labels the parts of the bar model

**Level 3 — Write the Number Sentence**

- User translates the word problem into a number sentence (e.g. “503 - 187 = ?”)
- App verifies the number sentence before the user solves it

**Level 4 — Solve with Chosen Method**

- User picks a method and solves with full intermediate steps

### 9.3 Word Problem Generation

```javascript
const wordProblemTemplates = {
  join_result_unknown: [
    "{name} had {n1} {object}. {pronoun} {verb_got} {n2} more. How many {object} does {name} have now?",
    "There were {n1} {object} in the {place}. {n2} more were {verb_added}. How many are there now?",
    "In the morning, {n1} {object} were {verb_counted}. By afternoon, {n2} more {verb_arrived}. What is the total?"
  ],
  // ... templates for each category
};

// Context themes to keep problems engaging
const themes = [
  { object: "stickers", place: "collection", names: ["Sam", "Aisha", "Leo"] },
  { object: "books", place: "library", names: ["Mrs Chen", "Mr Patel"] },
  { object: "steps", place: "walk to school", names: ["the children"] },
  { object: "points", place: "game", names: ["Team Red", "Team Blue"] },
  // ... many more
];
```

### 9.4 Word Problem Misunderstanding Detection

Common word problem mistakes to detect:

1. **Picks wrong operation** — adds when should subtract (or vice versa)
1. **Ignores part of a multi-step problem** — only does one operation
1. **Reverses the comparison** — finds “how many more A than B” but gives B’s count
1. **Treats “how many more” as addition** — common keyword trap
1. **Cannot extract numbers from context** — overwhelmed by text

Detection: The app asks the user to first write the number sentence. If the number sentence is wrong, remediation targets comprehension, not calculation.

-----

## 10. DATA MODEL & PROGRESSION LOGIC

### 10.1 User Progress Data Structure

```javascript
const userProgress = {
  // Module A: Facts
  additionFacts: {
    strategyGroups: {
      counting_on: { status: "mastered", unlockedAt: "2026-01-15" },
      doubles: { status: "practising", percentComplete: 72 },
      making_10: { status: "locked" },
      // ...
    },
    individualFacts: { /* per-fact mastery as in section 2.3 */ },
    overallAccuracy: 0.84,
    overallFluency: 0.61,  // % of facts at "fluent" level
  },
  subtractionFacts: { /* mirror structure */ },
  
  // Module B: Progressive Application
  progressiveLevels: {
    level2_2d_1d: { status: "mastered", bestMethods: ["sequencing", "compensation"] },
    level3_2d_2d: { status: "practising", percentComplete: 55 },
    level4_3d: { status: "locked" },
    level5_4d_plus: { status: "locked" },
    level6_mixed: { status: "locked" },
    level7_word_problems: { status: "locked" },
  },
  
  // Method proficiency
  methods: { /* as in section 7.3 */ },
  
  // Misunderstandings
  diagnostics: {
    identified: [
      {
        id: "always_subtracts_smaller_from_larger",
        detectedAt: "2026-02-01",
        remediationStatus: "in_progress",  // identified | in_progress | resolved
        remediationAttempts: 2,
        lastAttemptScore: 0.6
      }
    ],
    resolved: [ /* previously fixed misunderstandings */ ]
  },
  
  // Session history
  sessions: [
    {
      date: "2026-02-10",
      module: "addition_facts",
      duration: 480,  // seconds
      questionsAttempted: 25,
      correct: 21,
      strategies: { "doubles": 8, "making_10": 10, "bridge_10": 7 }
    }
  ]
};
```

### 10.2 Unlock Logic

```javascript
const unlockRules = {
  // Module A prerequisites
  "doubles_strategy":       () => strategyMastered("counting_on"),
  "doubles_plus_1":         () => strategyMastered("doubles"),
  "making_10":              () => strategyMastered("doubles"),
  "bridge_through_10":      () => strategyMastered("making_10"),
  
  // Module B prerequisites
  "level2_2d_1d":           () => additionFactsFluency() > 0.70 && subtractionFactsFluency() > 0.60,
  "level3_2d_2d":           () => levelMastered("level2_2d_1d"),
  "level4_3d":              () => levelMastered("level3_2d_2d"),
  "level5_4d_plus":         () => levelMastered("level4_3d"),
  "level6_mixed":           () => levelMastered("level4_3d"),
  "level7_word_problems":   () => levelMastered("level3_2d_2d"),  // Can start word problems earlier
  
  // Methods — all methods available from Level 2 onwards, but:
  "compensation":           () => strategyMastered("making_10") && strategyMastered("adding_9"),
  "same_difference":        () => methodConfident("compensation"),
};
```

### 10.3 Adaptive Difficulty Within Each Level

```javascript
function selectNextProblem(level, userHistory) {
  // 1. If misunderstandings are active, prioritise remediation
  if (activeMisunderstandings.length > 0) {
    return generateRemediationProblem(activeMisunderstandings[0]);
  }
  
  // 2. Spaced repetition: bring back previously struggled facts/problems
  const dueForReview = getSpacedRepetitionDue(userHistory);
  if (dueForReview.length > 0 && Math.random() < 0.3) {
    return dueForReview[0];
  }
  
  // 3. New material at the edge of the user's ability
  // - If last 5 questions were all correct and fast: increase difficulty
  // - If last 5 questions had 2+ errors: decrease difficulty
  // - Otherwise: stay at current difficulty
  const recentPerformance = userHistory.slice(-5);
  const difficulty = adjustDifficulty(recentPerformance, level);
  
  return generateProblem(level, difficulty);
}
```

-----

## 11. UI/UX SPECIFICATIONS

### 11.1 Navigation Structure

```
Home Dashboard
├── Addition & Subtraction Facts (Module A)
│   ├── Diagnostic Quiz
│   ├── Strategy Training (ordered list of strategies)
│   │   └── [Each strategy: Learn → Practice → Master]
│   ├── Mixed Fact Practice
│   └── Fact Dashboard (visual grid showing mastery per fact)
│
├── Number Application (Module B)
│   ├── Level Select (shows locked/unlocked levels)
│   ├── Method Training
│   │   └── [Each method: Learn → Guided → Independent]
│   ├── Problem Practice
│   │   ├── Choose difficulty level
│   │   ├── Choose method or "Any"
│   │   └── Solve with full steps shown
│   ├── Word Problems
│   │   ├── By type (join, separate, compare, multi-step)
│   │   └── Mixed
│   └── "Solve It Your Way" Challenge
│       └── See and compare multiple methods
│
├── Misunderstanding Centre
│   ├── Currently identified issues (with progress bars)
│   ├── Resolved issues (with dates)
│   └── Re-test option
│
└── Progress & Stats
    ├── Fact fluency grid (colour-coded)
    ├── Level progress
    ├── Method proficiency chart
    ├── Session history
    └── Misunderstanding timeline
```

### 11.2 Colour Coding

|Element                |Colour            |Usage              |
|-----------------------|------------------|-------------------|
|Correct answer         |Green (#4CAF50)   |Immediate feedback |
|Incorrect answer       |Soft red (#E57373)|Immediate feedback |
|Hint/explanation       |Blue (#42A5F5)    |Teaching content   |
|Fluent mastery         |Deep green        |Fact grid          |
|Secure mastery         |Light green       |Fact grid          |
|Developing             |Amber (#FFB74D)   |Fact grid          |
|Learning               |Light red         |Fact grid          |
|Locked                 |Grey (#BDBDBD)    |Unavailable content|
|Active misunderstanding|Orange (#FF9800)  |Diagnostic alerts  |

### 11.3 Key UI Components

1. **Fact Grid**: 13×13 grid showing all addition facts (0–12), colour-coded by mastery level. Tappable to see strategy and history for each fact.
1. **Method Cards**: Horizontally scrollable cards, each showing the method name, icon, and one-line description. Tappable to select.
1. **Step-by-Step Panel**: Expandable panel showing each intermediate step. Steps reveal one at a time (animated) or all at once (toggle).
1. **Visual Canvas**: Full-width area for rendering number lines, base-10 blocks, bar models, etc.
1. **Misunderstanding Alert**: Small banner that appears when the diagnostic engine detects a pattern. “We noticed something — would you like to work on it?”

-----

## 12. IMPLEMENTATION ORDER & FILE STRUCTURE

### 12.1 Suggested File Structure

```
js/
├── app.js                          (entry point, router)
├── config.js                       (constants, colours, thresholds)
│
├── facts/
│   ├── additionFacts.js            (addition fact generation & checking)
│   ├── subtractionFacts.js         (subtraction fact generation & checking)
│   ├── factStrategies.js           (strategy definitions & groupings)
│   ├── factMastery.js              (mastery tracking & spaced repetition)
│   └── factGrid.js                 (13×13 visual grid component)
│
├── methods/
│   ├── partitioning.js             (partitioning method logic + step gen)
│   ├── sequencing.js               (sequencing/jump method)
│   ├── compensation.js             (round and adjust)
│   ├── sameDifference.js           (same difference method)
│   ├── columnMethod.js             (traditional written method)
│   ├── countingOn.js               (counting on/back for close numbers)
│   ├── methodSelector.js           (determines applicable methods)
│   └── methodComparison.js         (side-by-side comparison view)
│
├── diagnostics/
│   ├── diagnosticQuiz.js           (initial and periodic assessment)
│   ├── errorPatterns.js            (pattern matching against Top 10)
│   ├── remediationEngine.js        (generates remediation sequences)
│   └── misunderstandingTracker.js  (tracks identified/resolved issues)
│
├── visuals/
│   ├── numberLine.js               (number line with animated jumps)
│   ├── base10Blocks.js             (place value blocks, breaking animation)
│   ├── tenFrames.js                (ten frame visualisation)
│   ├── barModel.js                 (bar/comparison models)
│   ├── partWholeModel.js           (cherry/part-whole diagram)
│   ├── placeValueChart.js          (column chart for written methods)
│   └── balanceScale.js             (equals/equation visualiser)
│
├── problems/
│   ├── problemGenerator.js         (generates problems for each level)
│   ├── wordProblemEngine.js        (templates, generation, scaffolding)
│   ├── wordProblemTemplates.js     (template strings by category)
│   └── difficultyEngine.js         (adaptive difficulty selection)
│
├── progress/
│   ├── progressTracker.js          (overall progress data management)
│   ├── sessionLogger.js            (per-session logging)
│   ├── statsView.js                (dashboard and charts)
│   └── progressionRules.js         (unlock logic)
│
├── ui/
│   ├── stepDisplay.js              (intermediate step rendering)
│   ├── methodCards.js              (method selection cards)
│   ├── feedbackAnimations.js       (correct/incorrect animations)
│   ├── scaffoldingUI.js            (word problem highlighting etc.)
│   └── navigation.js               (screen management)
│
└── data/
    ├── localStorage.js             (localStorage wrapper)
    ├── firebaseSync.js             (Firebase-compatible data layer)
    └── dataModels.js               (data structure definitions)

css/
├── main.css
├── facts.css
├── methods.css
├── visuals.css
├── progress.css
└── remediation.css
```

### 12.2 Implementation Phases

**Phase 1: Addition & Subtraction Facts Core** (Priority: HIGH)

1. `factStrategies.js` — Define all strategy groups and their facts
1. `additionFacts.js` + `subtractionFacts.js` — Problem generation
1. `factMastery.js` — Tracking system
1. `factGrid.js` — Visual mastery grid
1. Basic UI for practising facts by strategy

**Phase 2: Diagnostic Engine** (Priority: HIGH)

1. `diagnosticQuiz.js` — Initial assessment
1. `errorPatterns.js` — Pattern matching for Top 10 misunderstandings
1. `misunderstandingTracker.js` — Tracking state
1. Basic remediation flow (text-based explanations)

**Phase 3: Visual System** (Priority: MEDIUM-HIGH)

1. `numberLine.js` — Most versatile visual, used across many concepts
1. `base10Blocks.js` — Critical for place value understanding
1. `tenFrames.js` — Essential for making 10 and number bonds
1. `placeValueChart.js` — Needed for column method
1. `partWholeModel.js` and `barModel.js`

**Phase 4: Methods & Multi-Strategy** (Priority: MEDIUM)

1. `methodSelector.js` — Applicability rules
1. Implement each method module (partitioning, sequencing, etc.)
1. `stepDisplay.js` — Intermediate step rendering
1. `methodComparison.js` — Side-by-side view
1. `methodCards.js` — Selection UI

**Phase 5: Progressive Levels** (Priority: MEDIUM)

1. `problemGenerator.js` — Level 2–5 problem generation
1. `difficultyEngine.js` — Adaptive selection
1. `progressionRules.js` — Unlock logic
1. Level selection UI

**Phase 6: Remediation Units** (Priority: MEDIUM)

1. `remediationEngine.js` — Full incremental sum sequences
1. Integration with visual system for each misunderstanding
1. Re-assessment flow

**Phase 7: Word Problems** (Priority: MEDIUM-LOW)

1. `wordProblemTemplates.js` — Template library
1. `wordProblemEngine.js` — Generation and parsing
1. `scaffoldingUI.js` — Highlighting, bar model auto-generation
1. Word problem-specific misunderstanding detection

**Phase 8: Polish & Analytics** (Priority: LOW)

1. `statsView.js` — Comprehensive dashboard
1. `sessionLogger.js` — Detailed session data
1. Animations and transitions
1. “Method of the Day” feature
1. Educator/parent view

-----

## APPENDIX A: EXAMPLE REMEDIATION SEQUENCES

### A.1 Remediation: “Always Subtracts Smaller from Larger”

```
ILLUSTRATE:
  [Visual: Two bars. Top bar: 42 (split into 40 and 2). Bottom bar: 17 (split into 10 and 7)]
  "Look at 42 - 17. In the ones column, we need to take 7 from 2."
  "But 2 is smaller than 7! We can't just swap them."
  
  [Animation: The 40 breaks — one ten moves to the ones column]
  "We borrow a ten from the 40. Now we have 30 and 12."
  "12 - 7 = 5. Then 30 - 10 = 20. Answer: 25."

EXPLAIN:
  "When the top digit is smaller than the bottom digit, you must borrow (regroup) from
   the next column. You CANNOT just subtract the smaller from the larger — that gives a
   wrong answer."

GUIDED PRACTICE (Incremental):
  1. "13 - 5 = ?"  (simple borrow, one column)
     → Sub-steps: "Can you take 5 from 3? → Borrow → 13-5 = 8"
  
  2. "21 - 8 = ?"  
     → Sub-steps with visual blocks
  
  3. "42 - 17 = ?"  (the original error type)
     → Full sub-step guided walkthrough
  
  4. "53 - 29 = ?"
     → Sub-steps, user fills in each
  
  5. "71 - 45 = ?"
     → Minimal scaffolding

CHECK:
  5 questions of the form XX - YY where ones digit on top < ones digit on bottom.
  Must get 4/5 correct to proceed.
```

### A.2 Remediation: “Compensation Direction Reversed”

```
ILLUSTRATE:
  [Number line showing 45 + 28]
  "28 is close to 30. Let's add 30 instead — that's easier!"
  [Arrow: 45 → 75, labelled "+30"]
  "But wait — we added 2 too many (28→30 = +2 extra)"
  [Arrow: 75 → 73, labelled "-2"]
  "We added too much, so we SUBTRACT the extra. 45 + 28 = 73"
  
  [Second example: 63 - 29]
  "29 is close to 30. Let's subtract 30 instead."
  [Arrow: 63 → 33, labelled "-30"]
  "But we subtracted 1 too many (29→30 = 1 extra subtracted)"
  [Arrow: 33 → 34, labelled "+1"]
  "We subtracted too much, so we ADD back. 63 - 29 = 34"

EXPLAIN:
  "THE RULE: If you add too much → subtract the extra back.
   If you subtract too much → add the extra back.
   Think of it as 'undoing' the rounding."

GUIDED PRACTICE:
  1. "38 + 19 = ?"
     → "Round 19 to 20. How much extra? → 1"
     → "38 + 20 = ? → 58"
     → "You added 1 too much. Add or subtract 1? → Subtract"
     → "58 - 1 = 57 ✅"
  
  2. "45 - 18 = ?"
     → Same guided steps for subtraction compensation
  
  ... escalating difficulty
```

-----

## APPENDIX B: WORD PROBLEM TEMPLATE EXAMPLES

```javascript
// Join — Result Unknown
"There were {n1} {object} on the {place}. Then {n2} more {object} {verb_arrived}. How many {object} are there now?"
// Generates: "There were 347 books on the shelf. Then 256 more books arrived. How many books are there now?"

// Separate — Change Unknown  
"{name} had {n1} {object}. After giving some away, {pronoun} had {n2} left. How many did {name} give away?"
// Generates: "Aisha had 503 stickers. After giving some away, she had 316 left. How many did Aisha give away?"

// Compare — Difference Unknown
"{name1} scored {n1} points. {name2} scored {n2} points. How many more points did {higher_scorer} score than {lower_scorer}?"
// Generates: "Team Red scored 472 points. Team Blue scored 319 points. How many more points did Team Red score than Team Blue?"

// Multi-Step
"A school started the year with {n1} {object}. They {verb_gained} {n2} more in the autumn term and {verb_lost} {n3} in the spring term. How many {object} do they have now?"
// Generates: "A school started the year with 1,250 books. They bought 350 more in the autumn term and donated 175 in the spring term. How many books do they have now?"
```

-----

## APPENDIX C: SUMMARY OF ALL METHODS WITH INTERMEDIATE STEPS

### Addition Methods Summary

|Method      |Best For          |Steps Shown                                |
|------------|------------------|-------------------------------------------|
|Partitioning|General purpose   |Split → Add each column → Recombine        |
|Sequencing  |One number simpler|Start → +hundreds → +tens → +ones          |
|Compensation|Near-round numbers|Round → Easy calc → Adjust back            |
|Column      |Written fallback  |Ones → Tens → Hundreds (with carries shown)|

### Subtraction Methods Summary

|Method         |Best For             |Steps Shown                                |
|---------------|---------------------|-------------------------------------------|
|Partitioning   |No borrowing needed  |Split → Subtract each column → Recombine   |
|Sequencing     |Jump back method     |Start → -hundreds → -tens → -ones          |
|Compensation   |Near-round subtrahend|Round → Easy calc → Adjust back            |
|Same Difference|Make subtrahend round|Adjust both → Easy subtraction             |
|Counting On    |Close numbers        |Count from smaller to larger, sum the jumps|
|Column         |Written fallback     |Ones → Tens → Hundreds (with borrows shown)|

-----

*This plan is designed to be read by Claude Code and implemented module by module. Each section maps to specific files in the file structure. Begin with Phase 1 and proceed sequentially, testing each phase before moving to the next.*
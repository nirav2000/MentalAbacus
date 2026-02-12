# Mental Math App: Addition/Subtraction & Progressive Problem-Solving Plan
### Created by Claude Sonnet 4.5

## Document Overview

This document provides implementation specifications for:

1. Addition and subtraction fact mastery system
1. Progressive pathway from foundational number sense to complex problem-solving
1. Diagnostic system for common misconceptions
1. Adaptive intervention strategies

-----

## Part 1: Addition & Subtraction Facts System

### 1.1 Fact Categories & Progression

**Level 1: Foundational Concepts (Pre-facts)**

- Subitizing (recognizing quantities 1-5 without counting)
- Part-whole relationships with manipulatives
- Number bonds to 5, then 10
- One more/one less
- Two more/two less

**Level 2: Basic Facts (Sums to 10)**

- Doubles (1+1, 2+2, 3+3, 4+4, 5+5)
- Doubles +1 (near doubles: 3+4, 5+6)
- Making 10 (7+3, 6+4, 8+2, 9+1)
- Addition within 10 (all combinations)
- Related subtraction facts (fact families)

**Level 3: Facts to 20**

- Make-ten strategy (8+5 = 8+2+3)
- Doubles to 20 (6+6, 7+7, 8+8, 9+9, 10+10)
- Near doubles (7+8, 9+10)
- Subtraction from teens
- Bridging through 10

**Level 4: Larger Facts**

- Patterns in addition (adding 9, 8, 11)
- Compensation strategies
- Subtraction strategies (counting up vs counting back)
- Fact family fluency

### 1.2 Strategy Instruction Sequence

Each strategy needs:

```
Strategy Name: [e.g., "Making Ten"]
Visual Model: [Interactive illustration]
When to Use: [Problem types where this is efficient]
Step-by-Step: [Concrete procedure]
Practice Set: [Graduated difficulty]
Common Errors: [What to watch for]
```

**Priority Strategies:**

1. **Counting On** (for +1, +2, +3)
1. **Doubles** (foundation for near-doubles)
1. **Making 10** (critical for place value later)
1. **Compensation** (8+7 = 10+5)
1. **Fact Families** (understanding inverse operations)
1. **Bridging Through 10** (essential for mental math)

-----

## Part 2: Progressive Problem-Solving Framework

### 2.1 Skill Progression Pathway

```
Level 1: Number Sense Foundation
├─ Quantity recognition
├─ Comparing quantities
├─ Part-whole understanding
└─ Basic fact fluency

Level 2: Single-Step Mental Strategies
├─ Apply one strategy to simple problems
├─ Choose appropriate strategy for problem type
├─ Explain why strategy works
└─ Solve within time targets

Level 3: Multi-Step & Larger Numbers
├─ Decompose larger numbers
├─ Chain multiple strategies
├─ Mental math with 2-digit numbers
└─ Estimate and check reasonableness

Level 4: Complex Problem-Solving
├─ Word problems requiring strategy selection
├─ Multi-step problems
├─ Problems with multiple solution paths
└─ Create own problems
```

### 2.2 Strategy Selection Training

**Teach users to ask:**

1. “What numbers am I working with?”
1. “Which numbers are ‘friendly’ (near 10s, doubles, etc.)?”
1. “Can I break this apart?”
1. “Is there a pattern I can use?”

**Strategy Comparison Exercises:**

```
Problem: 47 + 38

Method A: (47 + 40) - 2 = 85
Method B: (50 + 35) = 85
Method C: (40 + 30) + (7 + 8) = 85

Discuss: Which felt easiest? Why?
```

-----

## Part 3: Diagnostic & Intervention System

### 3.1 Common Misconceptions Database

**Addition Misconceptions:**

|Error Pattern                    |Example                    |Root Cause                       |Intervention                                       |
|---------------------------------|---------------------------|---------------------------------|---------------------------------------------------|
|Counts all instead of counting on|7+3: “1,2,3,4,5,6,7,8,9,10”|Hasn’t internalized cardinality  |Number line visualization, start from larger number|
|Loses track while counting       |8+5 = 12 (miscounted)      |Working memory overload          |Teach anchoring strategies (use fingers, make ten) |
|Ignores place value              |24+8 = 212                 |Treats digits independently      |Base-10 blocks, place value charts                 |
|Always adds left-to-right        |47+38=715                  |Overgeneralizes reading direction|Explicitly teach place value addition              |

**Subtraction Misconceptions:**

|Error Pattern               |Example                      |Root Cause                   |Intervention                              |
|----------------------------|-----------------------------|-----------------------------|------------------------------------------|
|“Smaller from larger”       |42-17=35 (does 7-2, 4-1)     |Doesn’t understand borrowing |Part-whole models, missing addend approach|
|Subtracts in wrong direction|12-7=5 ✓ but 7-12=“you can’t”|Subtraction as take-away only|Number line (distance/difference model)   |
|Loses place value           |50-23=33 (thinks 5-2=3)      |Regrouping confusion         |Base-10 blocks, decomposition practice    |

### 3.2 Diagnostic Question Sets

**For each skill, include:**

1. **Surface Check** (Can they get the answer?)
1. **Strategy Check** (Do they use an efficient method?)
1. **Transfer Check** (Can they apply to new contexts?)
1. **Error Check** (Targeted problems that reveal misconceptions)

**Example Diagnostic Sequence:**

```
Skill: Making Ten Strategy

Surface: 8 + 6 = ?
Strategy: "How did you solve that? Show me."
Transfer: 18 + 6 = ? (does strategy extend?)
Error Check: 8 + 7 = ? (do they still make ten, or just memorize?)

If struggles detected → Branch to intervention
```

### 3.3 Intervention Protocol

**Step 1: Identify Misconception**

- Analyze error pattern across 3-5 problems
- Classify misconception type
- Determine prerequisite gaps

**Step 2: Visual/Concrete Model**

- Use manipulatives (virtual base-10 blocks, number lines, ten-frames)
- Animate the correct process
- Contrast correct vs incorrect thinking

**Step 3: Guided Practice**

- Provide scaffolded problems
- Use think-aloud prompts
- Gradually fade support

**Step 4: Independent Practice with Feedback**

- Mix of similar problems
- Immediate corrective feedback
- Celebrate correct strategy use, not just answers

**Step 5: Fluency Building**

- Timed practice (when ready)
- Mixed review to maintain skills

-----

## Part 4: Implementation Specifications

### 4.1 Data Structures

```typescript
// User Progress Model
{
  userId: string,
  currentLevel: {
    addition: number,
    subtraction: number,
    problemSolving: number
  },
  masteredFacts: {
    addition: Set<string>, // e.g., "7+8"
    subtraction: Set<string>
  },
  knownStrategies: {
    strategyName: {
      introduced: Date,
      proficiency: number (0-1),
      lastPracticed: Date
    }
  },
  identifiedMisconceptions: [
    {
      type: string,
      firstDetected: Date,
      interventionStatus: string,
      resolved: boolean
    }
  ],
  performanceMetrics: {
    accuracy: number,
    speed: number,
    strategyEfficiency: number
  }
}

// Problem Bank Structure
{
  problemId: string,
  category: string, // "basic_fact", "strategy_practice", "word_problem", etc.
  difficulty: number,
  requiredStrategies: string[],
  commonErrors: string[],
  visualSupport: string, // path to illustration
  scaffoldedSteps: [
    {
      hint: string,
      visualAid: string
    }
  ]
}
```

### 4.2 Adaptive Algorithm

```
On Problem Completion:
1. Record: answer, time, strategy used (if tracked)
2. Evaluate: correct? efficient strategy?
3. Update mastery level for that fact/skill
4. Check for error patterns
   - If 2+ similar errors in session → Flag for diagnosis
   - If 3+ similar errors across sessions → Trigger intervention
5. Select next problem based on:
   - Mastery levels (target 85-90% success rate)
   - Time since last practice of each skill
   - Mix of known and stretch problems
   - Identified weak areas

Intervention Triggering:
- If accuracy drops below 70% in category → Diagnostic mode
- If time >2x expected → Check for strategy use
- Pattern of specific error → Launch targeted intervention
```

### 4.3 UI/UX Flow

**Main Practice Mode:**

1. Problem presented with visual model (optional toggle)
1. User enters answer
1. If correct: Brief positive feedback, next problem
1. If incorrect:
- “Let’s look at that together”
- Show visual model with annotation
- Guided re-attempt
- Similar problem for immediate retry

**Intervention Mode:**

1. “I noticed something - let’s work on [skill] together”
1. Visual explanation of concept
1. 3-5 guided problems with scaffolding
1. Check for understanding
1. Return to main practice with mixed problems

**Strategy Selection Mode:**

1. Present problem
1. “Which strategy would you use?”
1. Show 2-3 strategy options
1. User selects, then solves
1. Discuss efficiency: “This worked! Could another way be faster?”

### 4.4 Visual Assets Needed

**Interactive Illustrations:**

- Ten-frames (draggable counters)
- Number lines (0-100, with zoom capability)
- Base-10 blocks (ones, tens, hundreds)
- Part-whole circles
- Bar models for word problems
- Arrays for multiplication/division connection

**Animations:**

- “Making ten” process (combining to 10, then adding remaining)
- Regrouping/borrowing in subtraction
- Decomposing numbers
- Counting on vs counting all

-----

## Part 5: Assessment & Reporting

### 5.1 Progress Indicators

**For Users:**

- “Facts Mastered” counter
- “Strategies Learned” badges
- “Problem-Solving Level” (visual tier system)
- Recent improvement graph

**For Educators/Parents:**

- Mastery heat map (which facts are solid, which need work)
- Strategy proficiency chart
- Common errors report
- Time-to-mastery projections
- Detailed session logs

### 5.2 Milestone Celebrations

- Mastery of all facts to 10
- First complex problem solved
- Strategy efficiency improvements
- Consecutive accurate sessions
- Speed improvements while maintaining accuracy

-----

## Part 6: Sample Implementation Roadmap

**Phase 1: Core Facts Engine**

- Build fact database (addition/subtraction to 20)
- Implement basic practice mode
- Create initial visual models
- Basic progress tracking

**Phase 2: Strategy Layer**

- Add strategy instruction modules
- Implement strategy selection exercises
- Build comparison/reflection prompts
- Enhanced visual explanations

**Phase 3: Diagnostic System**

- Error pattern recognition algorithm
- Misconception intervention library
- Adaptive difficulty adjustment
- Scaffolded help system

**Phase 4: Progressive Problem-Solving**

- Multi-step problem generator
- Word problem bank with scaffolding
- Strategy combination exercises
- Open-ended challenges

**Phase 5: Polish & Data**

- Comprehensive reporting dashboard
- Refined UI/UX based on testing
- Performance optimization
- Extended problem libraries

-----

## Technical Notes for Claude Code

1. **Prioritize modular design** - Each misconception intervention should be a separate module that can be triggered independently
1. **Problem generation should be dynamic** - Don’t just store static problems; generate variations to prevent memorization
1. **Visual models must be interactive** - Static images won’t support understanding; users should manipulate representations
1. **Track micro-behaviors** - Not just right/wrong, but hesitation time, strategy choice, need for hints
1. **Spaced repetition algorithm** - Mastered facts should return periodically to maintain fluency
1. **Fail-safes for frustration** - If user struggles on 3+ consecutive problems, ease difficulty and provide support
1. **Multiple input methods** - Number pad, keyboard, draggable answers (especially for younger users)

-----

## Summary

This plan provides a comprehensive framework for building an adaptive, pedagogically-sound mental math system that goes beyond drill-and-kill to develop true number sense and strategic thinking. The system diagnoses misconceptions, provides targeted interventions, and progressively develops problem-solving capabilities through strategic thinking and flexible mental math approaches.

-----

**Document Version:** 1.0  
**Date:** February 2026  
**Purpose:** Implementation guide for mental math application development

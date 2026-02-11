/* intervention.js - Strategy intervention system
   Triggers when a student gets 2+ wrong in a row on a strategy.
   Shows visual explanations, worked examples, and offers practice mode.
*/

const Intervention = {

    // Track consecutive wrong answers per strategy in current session
    consecutiveWrong: {},

    TRIGGER_THRESHOLD: 2,

    reset() {
        this.consecutiveWrong = {};
    },

    // Record an answer; returns true if intervention should trigger
    recordAnswer(strategyId, correct) {
        if (correct) {
            this.consecutiveWrong[strategyId] = 0;
            return false;
        }
        this.consecutiveWrong[strategyId] = (this.consecutiveWrong[strategyId] || 0) + 1;
        return this.consecutiveWrong[strategyId] >= this.TRIGGER_THRESHOLD;
    },

    // Strategy explanations with step-by-step examples
    explanations: {
        one_more_one_less: {
            title: 'One More, One Less',
            explain: 'To add 1, count one number forward. To subtract 1, count one number back.',
            steps: [
                { text: 'Start with the number: 7', highlight: '7' },
                { text: 'Count one more: 7 → 8', highlight: '8' },
                { text: 'So 7 + 1 = 8', highlight: '= 8' },
            ],
            example: '7 + 1 = 8',
        },
        know_about_zero: {
            title: 'Know About Zero',
            explain: 'Adding or subtracting 0 leaves the number unchanged. Any number minus itself equals 0.',
            steps: [
                { text: 'Start with any number: 5', highlight: '5' },
                { text: 'Add zero: 5 + 0', highlight: '+ 0' },
                { text: 'Nothing changes! 5 + 0 = 5', highlight: '= 5' },
            ],
            example: '5 + 0 = 5',
        },
        two_more_two_less: {
            title: 'Two More, Two Less',
            explain: 'To add 2, skip one number forward. To subtract 2, skip one back. Think even → even, odd → odd.',
            steps: [
                { text: 'Start with: 6', highlight: '6' },
                { text: 'Skip one number: 6 → 7 → 8', highlight: '8' },
                { text: 'So 6 + 2 = 8', highlight: '= 8' },
            ],
            example: '6 + 2 = 8',
        },
        five_and_a_bit: {
            title: 'Five and a Bit',
            explain: 'Numbers 6–9 are made of 5 and a little bit. Think of one full hand plus some fingers.',
            steps: [
                { text: 'One hand has 5 fingers', highlight: '5' },
                { text: 'Plus 2 more fingers: 5 + 2', highlight: '+ 2' },
                { text: 'That gives us 7!', highlight: '= 7' },
            ],
            example: '5 + 2 = 7',
        },
        number_neighbours: {
            title: 'Number Neighbours',
            explain: 'Neighbours are numbers right next to each other. Their difference is always 1 (or 2 for same odd/even).',
            steps: [
                { text: 'Look at 8 and 7', highlight: '8, 7' },
                { text: 'They are neighbours on the number line', highlight: 'neighbours' },
                { text: '8 − 7 = 1 (just one step apart)', highlight: '= 1' },
            ],
            example: '8 − 7 = 1',
        },
        doubles: {
            title: 'Doubles & Near Doubles',
            explain: 'Memorise your doubles (3+3=6, 4+4=8). For near doubles, use the double then adjust by 1.',
            steps: [
                { text: 'Know the double: 6 + 6 = 12', highlight: '12' },
                { text: 'For 6 + 7, start with the double', highlight: '6 + 6' },
                { text: '6 + 6 = 12, plus 1 more = 13', highlight: '= 13' },
            ],
            example: '6 + 7 = 13',
        },
        number_10_facts: {
            title: 'Number 10 Facts',
            explain: 'Learn pairs that make 10: 1+9, 2+8, 3+7, 4+6, 5+5. These are key building blocks!',
            steps: [
                { text: 'Think: what pairs with 3 to make 10?', highlight: '3 + ?' },
                { text: 'Count up from 3 to 10: that\'s 7', highlight: '7' },
                { text: '3 + 7 = 10 ✓', highlight: '= 10' },
            ],
            example: '3 + 7 = 10',
        },
        seven_tree_nine_square: {
            title: '7 Tree & 9 Square',
            explain: 'Picture 7 as a tree splitting into 3 and 4. Picture 9 as a 3×3 square (3 and 6).',
            steps: [
                { text: 'Picture 7 splitting like a tree', highlight: '7' },
                { text: 'One branch is 3, the other is 4', highlight: '3, 4' },
                { text: 'So 7 − 3 = 4 and 7 − 4 = 3', highlight: '= 4' },
            ],
            example: '7 = 3 + 4',
        },
        swap_it: {
            title: 'Swap It',
            explain: 'When adding, you can swap the numbers around. 2 + 8 is the same as 8 + 2. Start with the bigger number!',
            steps: [
                { text: 'See 2 + 8? The small number is first.', highlight: '2 + 8' },
                { text: 'Swap it! 8 + 2 is easier to count', highlight: '8 + 2' },
                { text: '8 + 2 = 10. Same answer!', highlight: '= 10' },
            ],
            example: '2 + 8 = 8 + 2 = 10',
        },
        ten_and_a_bit: {
            title: 'Ten and a Bit',
            explain: 'Numbers 11–19 are just 10 plus a bit. 10 + 3 = 13. Remove the ten and you see the bit.',
            steps: [
                { text: 'Start with 10', highlight: '10' },
                { text: 'Add the bit: 10 + 4', highlight: '+ 4' },
                { text: '10 + 4 = 14. The 1 is the ten!', highlight: '= 14' },
            ],
            example: '10 + 4 = 14',
        },
        make_ten_then: {
            title: 'Make Ten, Then...',
            explain: 'To add 8 + 5: first make 10 from 8 (need 2 more), then add the rest (3). 10 + 3 = 13.',
            steps: [
                { text: 'Start: 8 + 5', highlight: '8 + 5' },
                { text: 'Make 10: take 2 from the 5 → 8 + 2 = 10', highlight: '= 10' },
                { text: 'Add the rest: 10 + 3 = 13', highlight: '= 13' },
            ],
            example: '8 + 5 → 10 + 3 = 13',
        },
        adjust_it: {
            title: 'Adjust It',
            explain: 'To add 9, add 10 then subtract 1. To subtract 9, subtract 10 then add 1.',
            steps: [
                { text: 'Start: 7 + 9', highlight: '7 + 9' },
                { text: 'Adjust: add 10 instead → 7 + 10 = 17', highlight: '= 17' },
                { text: 'Fix: we added 1 too many → 17 − 1 = 16', highlight: '= 16' },
            ],
            example: '7 + 9 → 7 + 10 − 1 = 16',
        },
    },

    // Render the intervention popup HTML
    renderPopup(strategyId) {
        const info = this.explanations[strategyId];
        if (!info) return '';
        const strat = STRATEGIES.find(s => s.id === strategyId);

        let stepsHtml = '';
        info.steps.forEach((step, i) => {
            stepsHtml += `
            <div class="intervention-step" style="animation-delay:${i * 0.6}s">
                <div class="step-number">${i + 1}</div>
                <div class="step-text">${step.text}</div>
            </div>`;
        });

        return `
        <div class="intervention-overlay" id="intervention-overlay">
            <div class="intervention-popup">
                <div class="intervention-header">
                    <h3>${info.title}</h3>
                    <button class="btn btn-icon intervention-close" id="btn-close-intervention">&times;</button>
                </div>
                <p class="intervention-explain">${info.explain}</p>
                <div class="intervention-example">
                    <div class="intervention-example-label">Worked Example</div>
                    <div class="intervention-example-text">${info.example}</div>
                </div>
                <div class="intervention-steps">
                    ${stepsHtml}
                </div>
                <div class="intervention-actions">
                    <button class="btn btn-primary" id="btn-intervention-practice">Practice Mode (No Timer)</button>
                    <button class="btn" id="btn-intervention-continue">Continue Quiz</button>
                </div>
            </div>
        </div>`;
    },

    // Show the intervention popup
    show(strategyId, onPractice, onContinue) {
        const existing = document.getElementById('intervention-overlay');
        if (existing) existing.remove();

        const html = this.renderPopup(strategyId);
        if (!html) return;

        document.body.insertAdjacentHTML('beforeend', html);

        document.getElementById('btn-close-intervention').addEventListener('click', () => {
            this.hide();
            if (onContinue) onContinue();
        });

        document.getElementById('btn-intervention-continue').addEventListener('click', () => {
            this.hide();
            if (onContinue) onContinue();
        });

        document.getElementById('btn-intervention-practice').addEventListener('click', () => {
            this.hide();
            if (onPractice) onPractice(strategyId);
        });
    },

    hide() {
        const el = document.getElementById('intervention-overlay');
        if (el) {
            el.classList.add('fade-out');
            setTimeout(() => el.remove(), 300);
        }
    },
};

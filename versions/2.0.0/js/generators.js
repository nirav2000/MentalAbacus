/* generators.js - Problem generators for all 12 strategies
   Each returns: { questionText, answer, hint, visual, meta }
*/

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function levelMax(level, scale) {
    return scale[Math.min(level - 1, scale.length - 1)];
}

const Generators = {

    one_more_one_less(level) {
        const maxN = levelMax(level, [10, 15, 20, 50, 100]);
        const isAdd = Math.random() < 0.5;
        if (isAdd) {
            const a = randInt(0, maxN - 1);
            return {
                questionText: `${a} + 1 = ?`,
                answer: a + 1,
                hint: `Count one more from ${a}`,
                visual: { type: 'number-line', start: Math.max(0, a - 2), end: a + 3, highlight: a, target: a + 1 },
                meta: { operation: 'add', a, b: 1, strategy: 'one_more_one_less' },
            };
        }
        const a = randInt(1, maxN);
        return {
            questionText: `${a} − 1 = ?`,
            answer: a - 1,
            hint: `Count one back from ${a}`,
            visual: { type: 'number-line', start: Math.max(0, a - 3), end: a + 2, highlight: a, target: a - 1 },
            meta: { operation: 'sub', a, b: 1, strategy: 'one_more_one_less' },
        };
    },

    know_about_zero(level) {
        const maxN = levelMax(level, [10, 20, 50, 100, 200]);
        const type = pick(['add0', 'sub0', 'selfSub']);
        const a = randInt(0, maxN);
        if (type === 'add0') {
            return {
                questionText: `${a} + 0 = ?`, answer: a,
                hint: 'Adding 0 changes nothing!', visual: null,
                meta: { operation: 'add', a, b: 0, strategy: 'know_about_zero' },
            };
        }
        if (type === 'sub0') {
            return {
                questionText: `${a} − 0 = ?`, answer: a,
                hint: 'Subtracting 0 changes nothing!', visual: null,
                meta: { operation: 'sub', a, b: 0, strategy: 'know_about_zero' },
            };
        }
        return {
            questionText: `${a} − ${a} = ?`, answer: 0,
            hint: 'Any number minus itself is 0.',
            visual: null,
            meta: { operation: 'sub', a, b: a, strategy: 'know_about_zero' },
        };
    },

    two_more_two_less(level) {
        const maxN = levelMax(level, [10, 15, 20, 50, 100]);
        const isAdd = Math.random() < 0.5;
        if (isAdd) {
            const a = randInt(0, maxN - 2);
            return {
                questionText: `${a} + 2 = ?`, answer: a + 2,
                hint: a % 2 === 0 ? `${a} is even, next even is ${a + 2}` : `${a} is odd, next odd is ${a + 2}`,
                visual: { type: 'number-line', start: Math.max(0, a - 2), end: a + 4, highlight: a, target: a + 2 },
                meta: { operation: 'add', a, b: 2, strategy: 'two_more_two_less' },
            };
        }
        const a = randInt(2, maxN);
        return {
            questionText: `${a} − 2 = ?`, answer: a - 2,
            hint: a % 2 === 0 ? `${a} is even, previous even is ${a - 2}` : `${a} is odd, previous odd is ${a - 2}`,
            visual: { type: 'number-line', start: Math.max(0, a - 4), end: a + 2, highlight: a, target: a - 2 },
            meta: { operation: 'sub', a, b: 2, strategy: 'two_more_two_less' },
        };
    },

    five_and_a_bit(level) {
        const n = randInt(6, 9);
        const bit = n - 5;
        if (Math.random() < 0.5) {
            return {
                questionText: `5 + ${bit} = ?`, answer: n,
                hint: `5 and ${bit} makes ${n}. Think of a hand!`,
                visual: { type: 'dots', group1: 5, group2: bit },
                meta: { operation: 'add', a: 5, b: bit, strategy: 'five_and_a_bit' },
            };
        }
        return {
            questionText: `${n} − 5 = ?`, answer: bit,
            hint: `${n} is 5 and ${bit}.`,
            visual: { type: 'dots', group1: 5, group2: bit },
            meta: { operation: 'sub', a: n, b: 5, strategy: 'five_and_a_bit' },
        };
    },

    number_neighbours(level) {
        const maxN = levelMax(level, [10, 15, 20, 50, 100]);
        const gap = pick(level <= 2 ? [1] : [1, 2]);
        const a = randInt(gap, maxN);
        const b = a - gap;
        return {
            questionText: `${a} − ${b} = ?`, answer: gap,
            hint: gap === 1
                ? `${a} and ${b} are neighbours, difference is 1.`
                : `${a} and ${b} are both ${a % 2 === 0 ? 'even' : 'odd'}, difference is 2.`,
            visual: { type: 'number-line', start: Math.max(0, b - 2), end: a + 2, highlight: b, target: a },
            meta: { operation: 'sub', a, b, strategy: 'number_neighbours' },
        };
    },

    doubles(level) {
        const maxBase = levelMax(level, [5, 7, 10, 15, 20]);
        const isNear = level >= 2 && Math.random() < 0.5;
        const base = randInt(1, maxBase);

        if (!isNear) {
            return {
                questionText: `${base} + ${base} = ?`, answer: base * 2,
                hint: `Double ${base} is ${base * 2}.`,
                visual: { type: 'dots', group1: base, group2: base },
                meta: { operation: 'add', a: base, b: base, strategy: 'doubles' },
            };
        }
        const offset = pick([-1, 1]);
        const b = base + offset;
        if (b < 0) return Generators.doubles(level);
        return {
            questionText: `${base} + ${b} = ?`, answer: base + b,
            hint: `Near double: ${base} + ${base} = ${base * 2}, adjust by ${offset > 0 ? '+' : ''}${offset}.`,
            visual: { type: 'dots', group1: base, group2: b },
            meta: { operation: 'add', a: base, b, strategy: 'doubles' },
        };
    },

    number_10_facts(level) {
        const type = pick(level <= 2 ? ['bond', 'sub'] : ['bond', 'sub', 'missing']);
        if (type === 'bond') {
            const a = randInt(0, 10);
            return {
                questionText: `${a} + ${10 - a} = ?`, answer: 10,
                hint: `${a} and ${10 - a} make 10.`,
                visual: { type: 'ten-frame', filled: a, filledAlt: 10 - a },
                meta: { operation: 'add', a, b: 10 - a, strategy: 'number_10_facts' },
            };
        }
        if (type === 'sub') {
            const a = randInt(0, 10);
            return {
                questionText: `10 − ${a} = ?`, answer: 10 - a,
                hint: `If ${a} + ? = 10, then 10 − ${a} = ${10 - a}.`,
                visual: { type: 'ten-frame', filled: 10 - a, filledAlt: a },
                meta: { operation: 'sub', a: 10, b: a, strategy: 'number_10_facts' },
            };
        }
        const a = randInt(0, 10);
        return {
            questionText: `${a} + ? = 10`, answer: 10 - a,
            hint: `What goes with ${a} to make 10?`,
            visual: { type: 'ten-frame', filled: a, filledAlt: 0 },
            meta: { operation: 'missing_add', a, b: 10, strategy: 'number_10_facts' },
        };
    },

    seven_tree_nine_square(level) {
        const family = pick(['seven', 'nine']);
        if (family === 'seven') {
            const facts = [
                { q: '3 + 4 = ?', a: 7 }, { q: '4 + 3 = ?', a: 7 },
                { q: '7 − 3 = ?', a: 4 }, { q: '7 − 4 = ?', a: 3 },
            ];
            if (level >= 3) {
                facts.push({ q: '? + 4 = 7', a: 3 }, { q: '? + 3 = 7', a: 4 });
            }
            const f = pick(facts);
            return {
                questionText: f.q, answer: f.a,
                hint: 'The 7 tree: 7 splits into 3 and 4.',
                visual: { type: 'tree', total: 7, left: 3, right: 4 },
                meta: { operation: 'family', a: 7, strategy: 'seven_tree_nine_square' },
            };
        }
        const facts = [
            { q: '3 + 6 = ?', a: 9 }, { q: '6 + 3 = ?', a: 9 },
            { q: '9 − 3 = ?', a: 6 }, { q: '9 − 6 = ?', a: 3 },
        ];
        if (level >= 3) {
            facts.push({ q: '? + 6 = 9', a: 3 }, { q: '? + 3 = 9', a: 6 });
        }
        const f = pick(facts);
        return {
            questionText: f.q, answer: f.a,
            hint: 'The 9 square: 9 is 3 + 6.',
            visual: { type: 'square', total: 9, split1: 3, split2: 6 },
            meta: { operation: 'family', a: 9, strategy: 'seven_tree_nine_square' },
        };
    },

    swap_it(level) {
        const maxN = levelMax(level, [10, 15, 20, 30, 50]);
        const a = randInt(1, Math.floor(maxN / 2));
        const b = randInt(a + 1, Math.min(maxN - a, maxN));
        if (Math.random() < 0.5) {
            return {
                questionText: `${a} + ${b} = ?`, answer: a + b,
                hint: `Swap it! ${b} + ${a} might be easier.`,
                visual: null,
                meta: { operation: 'add', a, b, strategy: 'swap_it' },
            };
        }
        return {
            questionText: `${b} + ${a} = ?`, answer: a + b,
            hint: `${b} + ${a} = ${a} + ${b}. Order doesn't matter!`,
            visual: null,
            meta: { operation: 'add', a: b, b: a, strategy: 'swap_it' },
        };
    },

    ten_and_a_bit(level) {
        const type = pick(level <= 2 ? ['compose', 'decompose'] : ['compose', 'decompose', 'sub']);
        if (type === 'compose') {
            const bit = randInt(1, 9);
            return {
                questionText: `10 + ${bit} = ?`, answer: 10 + bit,
                hint: `Ten and ${bit} makes ${10 + bit}.`,
                visual: { type: 'ten-frame-plus', filled: 10, extra: bit },
                meta: { operation: 'add', a: 10, b: bit, strategy: 'ten_and_a_bit' },
            };
        }
        if (type === 'decompose') {
            const n = randInt(11, 19);
            return {
                questionText: `${n} − 10 = ?`, answer: n - 10,
                hint: `${n} is ten and ${n - 10}.`,
                visual: { type: 'ten-frame-plus', filled: 10, extra: n - 10 },
                meta: { operation: 'sub', a: n, b: 10, strategy: 'ten_and_a_bit' },
            };
        }
        const n = randInt(11, 19);
        const bit = n - 10;
        return {
            questionText: `${n} − ${bit} = ?`, answer: 10,
            hint: `${n} is 10 + ${bit}. Take away the bit.`,
            visual: { type: 'ten-frame-plus', filled: 10, extra: bit },
            meta: { operation: 'sub', a: n, b: bit, strategy: 'ten_and_a_bit' },
        };
    },

    make_ten_then(level) {
        const isAdd = level <= 2 || Math.random() < 0.65;
        if (isAdd) {
            const a = randInt(6, 9);
            const maxB = levelMax(level, [6, 8, 9, 12, 15]);
            const minB = 10 - a + 1;
            const b = randInt(minB, Math.min(maxB, 20 - a));
            const toTen = 10 - a;
            const rest = b - toTen;
            return {
                questionText: `${a} + ${b} = ?`, answer: a + b,
                hint: `Make 10: ${a} + ${toTen} = 10, then + ${rest} = ${a + b}.`,
                visual: { type: 'ten-frame-plus', filled: a, extra: b },
                meta: { operation: 'add', a, b, strategy: 'make_ten_then' },
            };
        }
        const result = randInt(1, 9);
        const a = randInt(11, 19);
        const b = a - result;
        if (b <= 0 || b > 20) return Generators.make_ten_then(level);
        return {
            questionText: `${a} − ${b} = ?`, answer: result,
            hint: `Subtract to 10 first: ${a} − ${a - 10} = 10, then 10 − ${10 - result} = ${result}.`,
            visual: null,
            meta: { operation: 'sub', a, b, strategy: 'make_ten_then' },
        };
    },

    adjust_it(level) {
        const maxN = levelMax(level, [12, 15, 20, 30, 50]);
        const isAdd = Math.random() < 0.5;
        if (isAdd) {
            const a = randInt(2, Math.floor(maxN / 2));
            const nearTen = pick([9, 11]);
            if (a + nearTen > maxN + 5) return Generators.adjust_it(level);
            const adj = nearTen === 9 ? -1 : 1;
            return {
                questionText: `${a} + ${nearTen} = ?`, answer: a + nearTen,
                hint: `Adjust: ${a} + 10 = ${a + 10}, then ${adj > 0 ? '+' : ''}${adj} = ${a + nearTen}.`,
                visual: null,
                meta: { operation: 'add', a, b: nearTen, strategy: 'adjust_it' },
            };
        }
        const a = randInt(12, maxN);
        const nearTen = pick([9, 11]);
        if (a - nearTen < 0) return Generators.adjust_it(level);
        const adj = nearTen === 9 ? 1 : -1;
        return {
            questionText: `${a} − ${nearTen} = ?`, answer: a - nearTen,
            hint: `Adjust: ${a} − 10 = ${a - 10}, then ${adj > 0 ? '+' : ''}${adj} = ${a - nearTen}.`,
            visual: null,
            meta: { operation: 'sub', a, b: nearTen, strategy: 'adjust_it' },
        };
    },
};

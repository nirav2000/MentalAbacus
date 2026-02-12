/* encouragement.js - Encouraging messages and avatar system */

const Encouragement = {

    messages: {
        correct: [
            'Great job!', 'Brilliant!', 'You got it!', 'Excellent!',
            'Superstar!', 'Nailed it!', 'Amazing!', 'Fantastic!',
            'You\'re on fire!', 'Keep it up!', 'Wonderful!', 'Top marks!',
        ],
        fast: [
            'You\'re getting faster!', 'Lightning speed!', 'Quick thinking!',
            'That was speedy!', 'Zoom! So fast!', 'Speed demon!',
        ],
        streak: [
            'Unstoppable!', 'On a roll!', 'Streak master!',
            'Can\'t stop you!', 'What a run!',
        ],
        improving: [
            'You\'re improving!', 'Getting better every day!',
            'Look at that progress!', 'Practice makes perfect!',
        ],
        nearlyThere: [
            'Nearly there!', 'So close!', 'Almost got it!',
            'Keep trying!', 'You can do it!',
        ],
        wrong: [
            'Don\'t worry, try again!', 'Keep going!',
            'Mistakes help us learn!', 'You\'ll get it next time!',
        ],
    },

    getMessage(context) {
        const { correct, timeMs, streak, mastery } = context;

        if (!correct) {
            if (mastery < 30) return pick(this.messages.nearlyThere);
            return pick(this.messages.wrong);
        }

        if (streak >= 5) return pick(this.messages.streak) + ` ${streak} in a row!`;
        if (timeMs <= 3000) return pick(this.messages.fast);
        if (mastery > 60) return pick(this.messages.improving);
        return pick(this.messages.correct);
    },

    // SVG avatar that reacts to performance
    renderAvatar(mood, size = 48) {
        const s = size;
        const cx = s / 2, cy = s / 2, r = s / 2 - 2;

        let faceColor, eyes, mouth;

        switch (mood) {
            case 'excited':
                faceColor = '#4ecdc4';
                eyes = `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.1}" fill="#000"/>
                         <circle cx="${cx + r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.1}" fill="#000"/>
                         <circle cx="${cx - r * 0.3}" cy="${cy - r * 0.25}" r="${r * 0.05}" fill="#fff"/>
                         <circle cx="${cx + r * 0.3}" cy="${cy - r * 0.25}" r="${r * 0.05}" fill="#fff"/>`;
                mouth = `<path d="M${cx - r * 0.35} ${cy + r * 0.15} Q${cx} ${cy + r * 0.6} ${cx + r * 0.35} ${cy + r * 0.15}" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>`;
                break;
            case 'happy':
                faceColor = '#4caf50';
                eyes = `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.08}" fill="#000"/>
                         <circle cx="${cx + r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.08}" fill="#000"/>`;
                mouth = `<path d="M${cx - r * 0.3} ${cy + r * 0.2} Q${cx} ${cy + r * 0.5} ${cx + r * 0.3} ${cy + r * 0.2}" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>`;
                break;
            case 'neutral':
                faceColor = '#ff9800';
                eyes = `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.08}" fill="#000"/>
                         <circle cx="${cx + r * 0.3}" cy="${cy - r * 0.15}" r="${r * 0.08}" fill="#000"/>`;
                mouth = `<line x1="${cx - r * 0.25}" y1="${cy + r * 0.25}" x2="${cx + r * 0.25}" y2="${cy + r * 0.25}" stroke="#000" stroke-width="2" stroke-linecap="round"/>`;
                break;
            case 'sad':
                faceColor = '#f44336';
                eyes = `<circle cx="${cx - r * 0.3}" cy="${cy - r * 0.1}" r="${r * 0.08}" fill="#000"/>
                         <circle cx="${cx + r * 0.3}" cy="${cy - r * 0.1}" r="${r * 0.08}" fill="#000"/>`;
                mouth = `<path d="M${cx - r * 0.25} ${cy + r * 0.35} Q${cx} ${cy + r * 0.1} ${cx + r * 0.25} ${cy + r * 0.35}" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round"/>`;
                break;
            default:
                faceColor = '#4ecdc4';
                eyes = '';
                mouth = '';
        }

        return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${faceColor}"/>
            ${eyes}
            ${mouth}
        </svg>`;
    },

    getMood(context) {
        const { correct, streak, mastery } = context;
        if (!correct) return mastery < 30 ? 'sad' : 'neutral';
        if (streak >= 5) return 'excited';
        if (streak >= 2) return 'happy';
        return 'happy';
    },
};

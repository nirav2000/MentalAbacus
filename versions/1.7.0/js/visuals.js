/* visuals.js - Visual aid renderers for teaching scaffolds
   Enhanced with larger sizes and interactive elements (tappable dots, draggable number line)
*/

const VisualRenderer = {

    render(visual) {
        if (!visual) return '';
        const fn = this[visual.type];
        return fn ? fn(visual) : '';
    },

    'number-line'(v) {
        let html = '<div class="number-line">';
        for (let i = v.start; i <= v.end; i++) {
            let cls = 'nl-num';
            if (i === v.highlight) cls += ' highlight';
            if (i === v.target) cls += ' target';
            html += `<div class="${cls}" data-nl-value="${i}">${i}</div>`;
        }
        return html + '</div>';
    },

    dots(v) {
        let html = '<div style="display:flex;gap:20px;align-items:center;">';
        html += '<div class="dot-group">';
        for (let i = 0; i < v.group1; i++) html += `<div class="dot" data-dot-index="${i}"></div>`;
        html += '</div>';
        if (v.group2 > 0) {
            html += '<span style="font-size:1.8rem;color:var(--text-muted);">+</span>';
            html += '<div class="dot-group">';
            for (let i = 0; i < v.group2; i++) html += `<div class="dot alt" data-dot-index="${v.group1 + i}"></div>`;
            html += '</div>';
        }
        return html + '</div>';
    },

    'ten-frame'(v) {
        let html = '<div class="ten-frame">';
        for (let i = 0; i < 10; i++) {
            let cls = 'cell';
            if (i < v.filled) cls += ' filled';
            else if (i < v.filled + v.filledAlt) cls += ' filled-alt';
            html += `<div class="${cls}" data-cell-index="${i}"></div>`;
        }
        return html + '</div>';
    },

    'ten-frame-plus'(v) {
        let html = '<div style="display:flex;gap:16px;align-items:center;">';
        html += '<div class="ten-frame">';
        const show = Math.min(v.filled, 10);
        for (let i = 0; i < 10; i++) {
            html += `<div class="cell ${i < show ? 'filled' : ''}" data-cell-index="${i}"></div>`;
        }
        html += '</div>';
        if (v.extra > 0) {
            html += '<div class="dot-group">';
            for (let i = 0; i < v.extra; i++) html += `<div class="dot alt" data-dot-index="${i}"></div>`;
            html += '</div>';
        }
        return html + '</div>';
    },

    tree(v) {
        return `<div style="text-align:center;font-size:1.5rem;">
            <div style="color:var(--accent);font-weight:800;font-size:2.2rem;">${v.total}</div>
            <div style="color:var(--text-muted);font-size:1.8rem;">/ \\</div>
            <div style="display:flex;justify-content:center;gap:40px;">
                <span style="color:var(--warning);font-weight:700;font-size:1.5rem;">${v.left}</span>
                <span style="color:var(--warning);font-weight:700;font-size:1.5rem;">${v.right}</span>
            </div>
        </div>`;
    },

    square(v) {
        let html = '<div style="display:inline-grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
        for (let i = 0; i < 9; i++) {
            const color = i < v.split1 ? 'var(--accent)' : 'var(--warning)';
            html += `<div style="width:30px;height:30px;border-radius:6px;background:${color};cursor:pointer;transition:transform 0.15s;" data-sq-index="${i}"></div>`;
        }
        return html + '</div>';
    },

    // Make visual elements interactive after rendering
    bindInteractions(container) {
        if (!container) return;

        // Tappable dots - toggle tapped state for counting
        container.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                dot.classList.toggle('tapped');
            });
        });

        // Tappable ten-frame cells
        container.querySelectorAll('.ten-frame .cell').forEach(cell => {
            cell.addEventListener('click', () => {
                cell.classList.toggle('tapped');
            });
        });

        // Number line - tap to highlight
        container.querySelectorAll('.nl-num').forEach(num => {
            num.addEventListener('click', () => {
                num.classList.toggle('dragging');
            });
        });

        // Square blocks
        container.querySelectorAll('[data-sq-index]').forEach(sq => {
            sq.addEventListener('click', () => {
                sq.style.transform = sq.style.transform === 'scale(0.8)' ? '' : 'scale(0.8)';
                sq.style.opacity = sq.style.opacity === '0.5' ? '' : '0.5';
            });
        });
    },
};

/* visuals.js - Visual aid renderers for teaching scaffolds */

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
            html += `<div class="${cls}">${i}</div>`;
        }
        return html + '</div>';
    },

    dots(v) {
        let html = '<div style="display:flex;gap:16px;align-items:center;">';
        html += '<div class="dot-group">';
        for (let i = 0; i < v.group1; i++) html += '<div class="dot"></div>';
        html += '</div>';
        if (v.group2 > 0) {
            html += '<span style="font-size:1.5rem;color:var(--text-muted);">+</span>';
            html += '<div class="dot-group">';
            for (let i = 0; i < v.group2; i++) html += '<div class="dot alt"></div>';
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
            html += `<div class="${cls}"></div>`;
        }
        return html + '</div>';
    },

    'ten-frame-plus'(v) {
        let html = '<div style="display:flex;gap:12px;align-items:center;">';
        html += '<div class="ten-frame">';
        const show = Math.min(v.filled, 10);
        for (let i = 0; i < 10; i++) {
            html += `<div class="cell ${i < show ? 'filled' : ''}"></div>`;
        }
        html += '</div>';
        if (v.extra > 0) {
            html += '<div class="dot-group">';
            for (let i = 0; i < v.extra; i++) html += '<div class="dot alt"></div>';
            html += '</div>';
        }
        return html + '</div>';
    },

    tree(v) {
        return `<div style="text-align:center;font-size:1.3rem;">
            <div style="color:var(--accent);font-weight:800;font-size:1.8rem;">${v.total}</div>
            <div style="color:var(--text-muted);font-size:1.5rem;">/ \\</div>
            <div style="display:flex;justify-content:center;gap:30px;">
                <span style="color:var(--warning);font-weight:700;">${v.left}</span>
                <span style="color:var(--warning);font-weight:700;">${v.right}</span>
            </div>
        </div>`;
    },

    square(v) {
        let html = '<div style="display:inline-grid;grid-template-columns:repeat(3,1fr);gap:4px;">';
        for (let i = 0; i < 9; i++) {
            const color = i < v.split1 ? 'var(--accent)' : 'var(--warning)';
            html += `<div style="width:22px;height:22px;border-radius:4px;background:${color};"></div>`;
        }
        return html + '</div>';
    },
};

/* charts.js - Pure SVG chart rendering for stats dashboard */

const Charts = {

    // Horizontal bar chart: [{ label, value, max, color }]
    barChart(data, opts = {}) {
        const {
            width = 340, barHeight = 28, gap = 6,
            labelWidth = 80, valueWidth = 45,
            bg = '#333', radius = 4,
        } = opts;
        const barArea = width - labelWidth - valueWidth - 16;
        const height = data.length * (barHeight + gap) + gap;

        let svg = `<svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:${width}px;">`;
        data.forEach((d, i) => {
            const y = i * (barHeight + gap) + gap;
            const barW = d.max > 0 ? (d.value / d.max) * barArea : 0;
            const color = d.color || 'var(--accent)';

            // Label
            svg += `<text x="0" y="${y + barHeight / 2 + 4}" fill="#aaa" font-size="11" font-family="var(--font)">${Charts._truncate(d.label, 12)}</text>`;

            // Background bar
            svg += `<rect x="${labelWidth}" y="${y}" width="${barArea}" height="${barHeight}" rx="${radius}" fill="${bg}" />`;

            // Value bar
            if (barW > 0) {
                svg += `<rect x="${labelWidth}" y="${y}" width="${Math.max(barW, 2)}" height="${barHeight}" rx="${radius}" fill="${color}" opacity="0.85">`;
                svg += `<animate attributeName="width" from="0" to="${Math.max(barW, 2)}" dur="0.5s" fill="freeze"/>`;
                svg += `</rect>`;
            }

            // Value text
            svg += `<text x="${labelWidth + barArea + 8}" y="${y + barHeight / 2 + 4}" fill="#f0f0f0" font-size="12" font-weight="700" font-family="var(--font)">${d.displayValue || d.value}${d.suffix || ''}</text>`;
        });
        svg += '</svg>';
        return svg;
    },

    // Line chart: { labels: [], datasets: [{ label, data: [], color }] }
    lineChart(config, opts = {}) {
        const {
            width = 340, height = 180,
            padTop = 20, padBottom = 30, padLeft = 35, padRight = 10,
            gridLines = 4, dotRadius = 3,
        } = opts;

        const chartW = width - padLeft - padRight;
        const chartH = height - padTop - padBottom;
        const labels = config.labels || [];
        const datasets = config.datasets || [];

        // Find global min/max
        let allVals = [];
        datasets.forEach(ds => allVals.push(...ds.data));
        const minVal = Math.min(0, ...allVals);
        const maxVal = Math.max(1, ...allVals);
        const range = maxVal - minVal || 1;

        let svg = `<svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="max-width:${width}px;">`;

        // Grid lines
        for (let i = 0; i <= gridLines; i++) {
            const y = padTop + (chartH / gridLines) * i;
            const val = Math.round(maxVal - (range / gridLines) * i);
            svg += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + chartW}" y2="${y}" stroke="#333" stroke-width="1"/>`;
            svg += `<text x="${padLeft - 6}" y="${y + 4}" fill="#666" font-size="10" text-anchor="end" font-family="var(--font)">${val}</text>`;
        }

        // X-axis labels
        const step = labels.length > 1 ? chartW / (labels.length - 1) : 0;
        const maxLabels = Math.min(labels.length, 8);
        const labelStep = Math.max(1, Math.floor(labels.length / maxLabels));
        labels.forEach((l, i) => {
            if (i % labelStep !== 0 && i !== labels.length - 1) return;
            const x = padLeft + step * i;
            svg += `<text x="${x}" y="${height - 5}" fill="#666" font-size="9" text-anchor="middle" font-family="var(--font)">${l}</text>`;
        });

        // Datasets
        datasets.forEach(ds => {
            const color = ds.color || 'var(--accent)';
            const points = ds.data.map((v, i) => {
                const x = padLeft + (labels.length > 1 ? (chartW / (labels.length - 1)) * i : chartW / 2);
                const y = padTop + chartH - ((v - minVal) / range) * chartH;
                return { x, y };
            });

            if (points.length > 1) {
                const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
                svg += `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
            }

            points.forEach(p => {
                svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dotRadius}" fill="${color}"/>`;
            });
        });

        svg += '</svg>';
        return svg;
    },

    // Mini sparkline for inline use
    sparkline(data, opts = {}) {
        const { width = 80, height = 24, color = 'var(--accent)' } = opts;
        if (!data.length) return '';
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const step = data.length > 1 ? width / (data.length - 1) : 0;

        const points = data.map((v, i) => {
            const x = step * i;
            const y = height - 2 - ((v - min) / range) * (height - 4);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        });

        return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
    },

    _truncate(str, max) {
        return str.length > max ? str.slice(0, max - 1) + '…' : str;
    },
};

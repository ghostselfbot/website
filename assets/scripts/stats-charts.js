window.GhostStatsCharts = (function () {
    const niceNumber = new Intl.NumberFormat('en-US');
    const platformLabels = {
        android: 'Android',
        darwin: 'macOS',
        linux: 'Linux',
        win32: 'Windows'
    };

    function toRows(entries) {
        return entries
            .sort((left, right) => right[1] - left[1])
            .map(([label, value]) => ({ label, value }));
    }

    function sumRows(rows) {
        return rows.reduce((sum, row) => sum + row.value, 0);
    }

    function renderBars(container, rows, total, formatter) {
        container.innerHTML = '';

        rows.forEach(({ label, value }, index) => {
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const row = document.createElement('div');
            row.className = 'stats-bar-row';
            row.style.setProperty('--bar-delay', `${index * 70}ms`);
            row.innerHTML = `
                <div class="stats-bar-meta">
                    <span class="stats-bar-label">${label}</span>
                    <span class="stats-bar-value">${formatter(value)}</span>
                </div>
                <div class="stats-bar-track" aria-hidden="true">
                    <div class="stats-bar-fill" style="width: ${Math.max(percentage, value > 0 ? 3 : 0)}%;"></div>
                </div>
            `;
            container.appendChild(row);
        });
    }

    function renderPlatformChart(container, rows) {
        const total = sumRows(rows);
        const colors = ['#7466ff', '#4f8cff', '#24c7a0', '#f0b45b'];
        const chartSize = 184;
        const center = chartSize / 2;
        const radius = 70;
        const strokeWidth = 38;
        let currentAngle = 0;
        const slices = rows.map(({ label, value }, index) => {
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const nextAngle = currentAngle + percentage;
            const circumference = 2 * Math.PI * radius;
            const dashLength = (percentage / 100) * circumference;
            const dashOffset = -(currentAngle / 100) * circumference;
            currentAngle = nextAngle;
            return {
                color: colors[index % colors.length],
                dashLength,
                dashOffset,
                label,
                percentage
            };
        });

        container.innerHTML = `
            <div class="stats-donut-wrap">
                <svg class="stats-donut" viewBox="0 0 ${chartSize} ${chartSize}" role="img" aria-label="Platform distribution">
                    ${slices.map(({ color, dashLength, dashOffset, label, percentage }) => `
                        <circle class="stats-donut-segment" cx="${center}" cy="${center}" r="${radius}"
                            pathLength="${2 * Math.PI * radius}" stroke="${color}" stroke-width="${strokeWidth}"
                            stroke-dasharray="${dashLength} ${2 * Math.PI * radius - dashLength}"
                            stroke-dashoffset="${dashOffset}" data-label="${label}" data-percentage="${percentage.toFixed(1)}"></circle>
                    `).join('')}
                </svg>
                <div class="stats-donut-tooltip" role="tooltip" hidden></div>
            </div>
            <div class="stats-platform-legend">
                ${rows.map(({ label }, index) => `
                    <div class="stats-platform-legend-item">
                        <span class="stats-platform-swatch" style="--platform-color: ${colors[index % colors.length]};" aria-hidden="true"></span>
                        <span>${label}</span>
                    </div>
                `).join('')}
            </div>
        `;

        const tooltip = container.querySelector('.stats-donut-tooltip');
        const donutWrap = container.querySelector('.stats-donut-wrap');
        const positionTooltip = (event) => {
            const bounds = donutWrap.getBoundingClientRect();
            tooltip.style.left = `${event.clientX - bounds.left}px`;
            tooltip.style.top = `${event.clientY - bounds.top}px`;
        };

        container.querySelectorAll('.stats-donut-segment').forEach((segment) => {
            segment.addEventListener('pointerenter', (event) => {
                tooltip.textContent = `${segment.dataset.label}: ${segment.dataset.percentage}%`;
                tooltip.hidden = false;
                positionTooltip(event);
            });
            segment.addEventListener('pointermove', positionTooltip);
            segment.addEventListener('pointerleave', () => {
                tooltip.hidden = true;
            });
        });
    }

    function formatSnapshotDate(snapshot) {
        const date = new Date(`${snapshot.week_start || snapshot.captured_at}T00:00:00`);
        return Number.isNaN(date.getTime()) ? 'Unknown week' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    }

    function renderHistory(container, countChip, emptyNote, history, historyLimit) {
        const snapshots = (history.snapshots || [])
            .slice()
            .sort((left, right) => new Date(left.captured_at) - new Date(right.captured_at))
            .slice(-historyLimit);
        countChip.textContent = `${snapshots.length} snapshot${snapshots.length === 1 ? '' : 's'}`;

        if (!snapshots.length) {
            container.innerHTML = '<div class="stats-history-empty">The first Monday snapshot will appear here.</div>';
            emptyNote.hidden = true;
            return;
        }

        const series = [
            { key: 'total_installs', label: 'Total installs', color: '#8e83ff' },
            { key: 'active_30d', label: 'Active in 30d', color: '#4f8cff' },
            { key: 'active_7d', label: 'Active in 7d', color: '#24c7a0' }
        ];
        const width = 720;
        const height = 230;
        const padding = { top: 18, right: 18, bottom: 38, left: 42 };
        const plotWidth = width - padding.left - padding.right;
        const plotHeight = height - padding.top - padding.bottom;
        const maxValue = Math.max(...snapshots.flatMap((snapshot) => series.map(({ key }) => Number(snapshot[key] || 0))), 1);
        const x = (index) => snapshots.length === 1 ? width / 2 : padding.left + (index / (snapshots.length - 1)) * plotWidth;
        const y = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight;
        const gridLines = [0, 0.5, 1].map((ratio) => {
            const lineY = padding.top + plotHeight * ratio;
            return `<line class="stats-history-grid-line" x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}"></line>`;
        }).join('');
        const paths = series.map(({ key, color }) => {
            const points = snapshots.map((snapshot, index) => `${x(index)},${y(Number(snapshot[key] || 0))}`).join(' ');
            const markers = snapshots.map((snapshot, index) => `<circle class="stats-history-point" cx="${x(index)}" cy="${y(Number(snapshot[key] || 0))}" r="4" fill="${color}"><title>${niceNumber.format(Number(snapshot[key] || 0))}</title></circle>`).join('');
            return `<polyline class="stats-history-line" points="${points}" stroke="${color}"></polyline>${markers}`;
        }).join('');
        const axisLabels = [1, 0.5, 0].map((ratio) => `<span>${niceNumber.format(Math.round(maxValue * ratio))}</span>`).join('');
        const dateLabels = snapshots.map((snapshot) => `<span>${formatSnapshotDate(snapshot)}</span>`).join('');

        container.innerHTML = `
            <div class="stats-history-legend">${series.map(({ label, color }) => `<span><i style="--history-color: ${color};"></i>${label}</span>`).join('')}</div>
            <div class="stats-history-plot">
                <div class="stats-history-y-axis">${axisLabels}</div>
                <div class="stats-history-plot-body">
                    <svg class="stats-history-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">${gridLines}${paths}</svg>
                    <div class="stats-history-x-axis">${dateLabels}</div>
                </div>
            </div>
        `;
        emptyNote.hidden = snapshots.length > 1;
        emptyNote.textContent = 'This is the baseline snapshot. New Monday snapshots will reveal the trend here.';
    }

    return {
        niceNumber,
        platformLabels,
        toRows,
        renderBars,
        renderPlatformChart,
        renderHistory
    };
}());
(function () {
    const config = window.GhostStatsData;
    const charts = window.GhostStatsCharts;
    const statsApi = config.statsApi;
    const historyApi = `${config.historyApi}?limit=${config.historyLimit}`;
    const statusText = document.getElementById('stats-status-text');
    const lastUpdated = document.getElementById('stats-last-updated');
    const platformTotalChip = document.getElementById('platform-total-chip');
    const featuredActiveLast24h = document.getElementById('featured-active-last-24h');
    const featuredTotalInstalls = document.getElementById('featured-total-installs');
    const featuredInstallsWeek = document.getElementById('featured-installs-week');
    const featuredLatestVersion = document.getElementById('featured-latest-version');
    const headerUsers = document.getElementById('home-header-users');
    const historyCountChip = document.getElementById('history-count-chip');
    const historyChart = document.getElementById('history-chart');
    const historyEmptyNote = document.getElementById('history-empty-note');

    function formatValue(value, key) {
        if (key === 'latest_version') {
            return String(value);
        }

        if (typeof value === 'number') {
            return charts.niceNumber.format(value);
        }

        return String(value);
    }

    function renderDashboard(data, statusMessage, lastUpdatedMessage) {
        const totalInstalls = Number(data.total_installs || 0);
        const platformRows = charts.toRows(Object.entries(data.platform_breakdown || {}))
            .map(({ label, value }) => ({ label: charts.platformLabels[label] || label, value }));
        const versionRows = charts.toRows(Object.entries(data.version_breakdown_active_30d || {}));

        featuredActiveLast24h.textContent = charts.niceNumber.format(Number(data.active_last_24h || 0));
        featuredTotalInstalls.textContent = charts.niceNumber.format(totalInstalls);
        featuredInstallsWeek.textContent = charts.niceNumber.format(Number(data.new_installs_week || 0));
        featuredLatestVersion.textContent = formatValue(data.latest_version, 'latest_version');
        headerUsers.textContent = `${charts.niceNumber.format(totalInstalls)} users`;
        platformTotalChip.textContent = `${charts.niceNumber.format(totalInstalls)} installs`;

        charts.renderPlatformChart(document.getElementById('platform-breakdown'), platformRows);
        charts.renderBars(document.getElementById('version-breakdown'), versionRows, totalInstalls, (value) => charts.niceNumber.format(value));
        statusText.textContent = statusMessage;
        lastUpdated.textContent = lastUpdatedMessage;
    }

    function renderHistory(history) {
        charts.renderHistory(historyChart, historyCountChip, historyEmptyNote, history, config.historyLimit);
    }

    async function loadStats() {
        const isLocalPreview = location.protocol === 'file:' || ['localhost', '127.0.0.1', '::1'].includes(location.hostname);

        if (isLocalPreview) {
            renderDashboard(config.fallbackStats, 'Local preview uses the provided snapshot', 'Live data is attempted on the deployed Ghost site');
            renderHistory(config.fallbackHistory);
            return;
        }

        try {
            const [response, historyResponse] = await Promise.all([
                fetch(statsApi, { cache: 'no-store' }),
                fetch(historyApi, { cache: 'no-store' })
            ]);

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            renderDashboard(await response.json(), `Live data loaded from ${statsApi}`, 'Latest version: live • Active recent: updated in real time');
            renderHistory(historyResponse.ok ? await historyResponse.json() : config.emptyHistory);
        } catch (error) {
            renderDashboard(config.fallbackStats, 'Live data unavailable locally, showing the provided snapshot', 'Snapshot based on the example payload you supplied');
            renderHistory(config.emptyHistory);
        }
    }

    loadStats();
}());
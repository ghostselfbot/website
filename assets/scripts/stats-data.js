window.GhostStatsData = {
    statsApi: 'https://benny.fun/api/ghost/stats',
    historyApi: 'https://benny.fun/api/ghost/stats/history',
    historyLimit: 5,
    fallbackStats: {
        active_last_24h: 15,
        active_last_30d: 109,
        active_last_7d: 36,
        latest_version: '4.3.0',
        new_installs_week: 27,
        platform_breakdown: {
            android: 6,
            linux: 24,
            macos: 18,
            windows: 121
        },
        total_installs: 169,
        version_breakdown_active_30d: {
            '4.2.3': 38,
            '4.2.4-dev': 50,
            '4.3.0': 21
        }
    },
    fallbackHistory: {
        snapshots: [
            { active_30d: 74, active_7d: 25, captured_at: '2026-08-03T13:47:27Z', total_installs: 124, week_start: '2026-08-03' },
            { active_30d: 81, active_7d: 28, captured_at: '2026-08-10T13:47:27Z', total_installs: 136, week_start: '2026-08-10' },
            { active_30d: 86, active_7d: 31, captured_at: '2026-08-17T13:47:27Z', total_installs: 150, week_start: '2026-08-17' },
            { active_30d: 92, active_7d: 34, captured_at: '2026-08-24T13:47:27Z', total_installs: 147, week_start: '2026-08-24' },
            { active_30d: 98, active_7d: 32, captured_at: '2026-08-31T13:47:27Z', total_installs: 154, week_start: '2026-08-31' },
            { active_30d: 104, active_7d: 39, captured_at: '2026-09-07T13:47:27Z', total_installs: 161, week_start: '2026-09-07' },
            { active_30d: 109, active_7d: 36, captured_at: '2026-09-13T13:47:27Z', total_installs: 169, week_start: '2026-09-13' }
        ]
    },
    emptyHistory: { snapshots: [] }
};
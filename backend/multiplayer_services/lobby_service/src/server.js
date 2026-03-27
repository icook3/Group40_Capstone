const http = require('http');
const WebSocket = require('ws');
const { handleMessage, handleDisconnect } = require('./handlers');
const { authGuest } = require('./auth');

const PORT = process.env.LOBBY_PORT || 4000;

function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/auth/guest') {
        let body = '';

        // Collect incoming request body chunks
        req.on('data', chunk => body += chunk);

        req.on('end', async () => {
            try {
                const { display_name } = JSON.parse(body);
                const result = await authGuest(display_name);
                sendJSON(res, 200, result);
            } catch (err) {
                sendJSON(res, 400, { error: err.message });
            }
        });
    } else {
        sendJSON(res, 404, { error: 'Not found' });
    }
})

// WebSocket server shares the same port as the HTTP server
// ws handles the HTTP upgrade to WebSocket automatically
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.isAuthenticated = false;

    // If no AUTH message arrives within 5 seconds, close the connection
    ws.authTimeout = setTimeout(() => {
        if (!ws.isAuthenticated) {
            ws.close(4002, 'Authentication timeout');
        }
    }, 5000);

    ws.on('message', (data) => {
        handleMessage(ws, data);
    });

    ws.on('close', () => {
        clearTimeout(ws.authTimeout);
        handleDisconnect(ws);
    });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Lobby service running on port ${PORT}`);
    })
}

module.exports = { server, wss }
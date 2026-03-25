const http = require('http');
const WebSocket = require('ws');
const { handleConnect, handleDisconnect, handleMessage, createSession } = require('./session');

const PORT = process.env.PORT || 4003;

function sendJSON(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/sessions') {
        let body = '';

        // Collect incoming request body chunks
        req.on('data', chunk => body += chunk);

        req.on('end', async () => {
            try {
                const { session_id, player_ids, duration_seconds } = JSON.parse(body);
                const result = await createSession(session_id, player_ids, duration_seconds);
                sendJSON(res, 200, result);
            } catch (err) {
                sendJSON(res, 400, { error: err.message });
            }
        })
    } else {
        sendJSON(res, 404, { error: 'Not found' });
    }
})

// WebSocket server shares the same port as the HTTP server
// ws handles the HTTP upgrade to WebSocket automatically
const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws, req) => {
    // Extract session_id and token from the connection URL
    // ws://game-service/sessions/{session_id}?token={token}
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const token = url.searchParams.get('token');
    const session_id = url.pathname.split('/')[2];

    ws.isAuthenticated = false;
    ws.token = token;
    ws.session_id = session_id;

    await handleConnect(ws);

    ws.on('message', (data) => {
        handleMessage(ws, data);
    });

    ws.on('close', () => {
        handleDisconnect(ws);
    });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Game session service running on port ${PORT}`);
    })
}

module.exports = { server, wss };
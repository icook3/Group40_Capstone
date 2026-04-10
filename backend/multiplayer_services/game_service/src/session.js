const redis = require('./redis');
const { encode, decode, MSG } = require('./packet');
const { startTick, stopTick } = require('./tick');

// Active sessions. Map of session_id to session obj
const sessions = new Map();

// Map of player_id to session_id
const playerSession = new Map();

function send(ws, buf) {
    if (ws.readyState === 1) {
        ws.send(buf);
    }
}

function sendError(ws, code, message) {
    send(ws, encode.error(code, message));
    ws.close();
}

async function createSession(session_id, player_ids, duration_seconds) {
    if (sessions.has(session_id)) {
        throw new Error('Session already exists');
    }

    const session = {
        session_id,
        duration_seconds,
        started_at: null,
        players: new Map(),
        expected: player_ids,
        slots: {},
        tick_interval: null
    };

    // Assign slot number to the expected player
    player_ids.forEach((id, index) => {
        session.slots[id] = index + 1
    });

    sessions.set(session_id, session);

    return { ok: true };
}

async function handleConnect(ws) {
    try {
        const tokenData = await redis.get(`session:token:${ws.token}`);
        if (!tokenData) {
            sendError(ws, 0x01, 'Invalid or expired token');
            return;
        }

        const { player_id, session_id } = JSON.parse(tokenData);

        if (session_id !== ws.session_id) {
            sendError(ws, 0x01, 'Invalid or expired token');
            return;
        }

        await redis.del(`session:token:${ws.token}`);

        const session = sessions.get(session_id);
        if (!session) {
            sendError(ws, 0x02, 'Session not found');
            return;
        }

        if (session.players.size >= session.expected.length) {
            sendError(ws, 0x03, 'Session already full');
            return;
        }

        ws.isAuthenticated = true;
        ws.player_id = player_id;

        session.players.set(player_id, {
            ws,
            player_id,
            power: 0,
            speed: 0,
            x: 0,
            y: 0,
            lastSeen: Date.now()
        });

        playerSession.set(player_id, session_id);

        // Send SESSION_JOIN to client
        const slot = session.slots[player_id];
        send(ws, encode.sessionJoin(
            slot,
            session.expected.length,
            session.duration_seconds
        ));

        // Start tick loop once one player has connected
        if (session.players.size === 1) {
            session.started_at = Date.now();
            session.tick_interval = startTick(session, () => {
                endSession(session_id, 0x01); // Duration reached
            });
        }
    } catch (err) {
        sendError(ws, 0x02, 'Session not found');
    }
}

function handleMessage(ws, data) {
    if (!ws.isAuthenticated) {
        return;
    }

    let packet;
    try {
        packet = decode(Buffer.from(data));
    } catch (err) {
        send(ws, encode.error(0x04, 'Malformed packet'));
        return;
    }

    const session_id = playerSession.get(ws.player_id);
    if (!session_id) {
        return;
    }

    const session = sessions.get(session_id);
    if (!session) {
        return;
    }

    const player = session.players.get(ws.player_id);
    if (!player) {
        return;
    }

    switch (packet.msgType) {
        case MSG.RIDER_INPUT:
            player.power = packet.data.power;
            player.speed = packet.data.speed;
            player.x = packet.data.x;
            player.y = packet.data.y;
            player.lastSeen = Date.now();
            break;

        case MSG.HEARTBEAT:
            player.lastSeen = Date.now();
            break;
    }
}

async function handleDisconnect(ws) {
    if (!ws.player_id) {
        return;
    }

    const session_id = playerSession.get(ws.player_id);
    if (!session_id) {
        return;
    }

    const session = sessions.get(session_id);
    if (!session) {
        return;
    }

    session.players.delete(ws.player_id);
    playerSession.delete(ws.player_id);

    if (session.players.size === 0) {
        await endSession(session_id, 0x02);
    }
}

async function endSession(session_id, reason) {
    const session = sessions.get(session_id);
    if (!session) {
        return;
    }

    stopTick(session);

    // Broadcast SESSION_END to all remaining players
    const packet = encode.sessionEnd(reason);
    for (const player of session.players.values()) {
        send(player.ws, packet);
    }

    // Clean up player map
    for (const player_id of session.players.keys()) {
        playerSession.delete(player_id);
    }

    sessions.delete(session_id);
}

module.exports = {
    createSession,
    handleConnect,
    handleMessage,
    handleDisconnect,
    sessions
};
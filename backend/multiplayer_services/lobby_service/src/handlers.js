const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const { verifyToken } = require('./auth')
const {
    createLobby,
    getLobby,
    getPublicLobbies,
    addPlayer,
    removePlayer,
    setPlayerReady,
    deleteLobby,
    storeSessionToken,
    getPlayerLobby
} = require('./lobby')

const clients = new Map();

function send(ws, type, payload) {
    ws.send(JSON.stringify({ type, payload}));
}

function sendError(ws, code, message) {
    send(ws, 'ERROR', { code, message });
}

function broadcast(players, type, payload) {
    for (const player of players) {
        const ws = clients.get(player.player_id);
        if (ws && ws.readyState === 1) {
            send(ws, type, payload);
        }
    }
}

function lobbyStatePayload(lobby) {
    return {
        lobby_id: lobby.lobby_id,
        name: lobby.name,
        max_players: lobby.max_players,
        duration_minutes: lobby.duration_minutes,
        password_protected: lobby.password_protected,
        host_id: lobby.host_id,
        players: lobby.players.map(p => ({
            player_id: p.player_id,
            display_name: p.display_name,
            ready: p.ready,
            player_data: p.player_data
        }))
    };
}

async function handleMessage(ws, data) {
    let parsed;

    try {
        parsed = JSON.parse(data);
    } catch {
        sendError(ws, 4000, 'Malformed JSON');
        return;
    }

    const { type, payload } = parsed;

    // All messages except AUTH require the client to be authenticated
    if (!ws.isAuthenticated && type !== 'AUTH') {
        sendError(ws, 4001, 'Authentication required');
        return;
    }

    switch (type) {
        case 'AUTH':           return handleAuth(ws, payload);
        case 'CREATE_LOBBY':   return handleCreateLobby(ws, payload);
        case 'GET_LOBBIES':    return handleGetLobbies(ws);
        case 'JOIN_LOBBY':     return handleJoinLobby(ws, payload);
        case 'SET_READY':      return handleSetReady(ws, payload);
        case 'START_GAME':     return handleStartGame(ws);
        case 'LEAVE_LOBBY':    return handleLeaveLobby(ws);
        default:
            sendError(ws, 4000, `Unknown message type: ${type}`);
    }
}

async function handleAuth(ws, payload) {
    try {
        const { player_id, token } = payload;
        const decoded = verifyToken(token);

        // Confirm token belongs to the player
        if (decoded.player_id !== player_id) {
            sendError(ws, 4001, 'Authentication failed');
            return;
        }

        ws.isAuthenticated = true;
        ws.player_id = decoded.player_id;
        ws.display_name = decoded.display_name;
        ws.player_data = payload.player_data || null;

        clearTimeout(ws.authTimeout);

        clients.set(ws.player_id, ws);

        send(ws, 'AUTH_ACK', { player_id: ws.player_id });
    } catch (err) {
        sendError(ws, 4001, 'Authentication failed');
    }
}

async function handleCreateLobby(ws, payload) {
    try {
        const { name, max_players, duration_minutes, password } = payload;

        if (![2, 4, 8, 16].includes(max_players)) {
            sendError(ws, 4008, 'Invalid max_players value');
            return;
        }

        if (!duration_minutes || duration_minutes % 10 !== 0 || duration_minutes < 10 || duration_minutes > 240) {
            sendError(ws, 4009, 'Invalid duration value');
            return;
        }

        const existingLobby = await getPlayerLobby(ws.player_id);
        if (existingLobby) {
            sendError(ws, 4007, 'Already in a lobby');
            return;
        }

        // Hash the password if one was provided
        const password_hash = password ? await bcrypt.hash(password, 10) : null;

        const lobby = await createLobby({
            player_id: ws.player_id,
            display_name: ws.display_name,
            name,
            max_players,
            duration_minutes,
            password_hash,
            player_data: ws.player_data
        });

        send(ws, 'LOBBY_CREATED', lobbyStatePayload(lobby));
    } catch (err) {
        sendError(ws, 5000, 'Failed to create lobby');
    }
}

async function handleGetLobbies(ws) {
    try {
        const lobbies = await getPublicLobbies();
        send(ws, 'LOBBY_LIST', { lobbies });
    } catch (err) {
        sendError(ws, 5000, 'Failed to get lobbies');
    }
}

async function handleJoinLobby(ws, payload) {
    try {
        const { lobby_id, password } = payload;

        const existingLobby = await getPlayerLobby(ws.player_id);
        if (existingLobby) {
            sendError(ws, 4007, 'Already in a lobby');
            return;
        }

        const lobby = await getLobby(lobby_id)
        if (!lobby) {
            sendError(ws, 4004, 'Lobby not found');
            return;
        }

        if (lobby.players.length >= lobby.max_players) {
            sendError(ws, 4005, 'Lobby full');
            return;
        }

        if (lobby.password_protected) {
            if (!password) {
                sendError(ws, 4003, 'Incorrect password');
                return;
            }
            const match = await bcrypt.compare(password, lobby.password_hash);
            if (!match) {
                sendError(ws, 4003, 'Incorrect password');
                return;
            }
        }

        const updatedLobby = await addPlayer(lobby_id, ws.player_id, ws.display_name, ws.player_data);

        broadcast(updatedLobby.players, 'LOBBY_STATE', lobbyStatePayload(updatedLobby));
    } catch (err) {
        sendError(ws, 5000, 'Failed to join lobby');
    }
}

async function handleSetReady(ws, payload) {
    try {
        const { ready } = payload;

        const lobby_id = await getPlayerLobby(ws.player_id);
        if (!lobby_id) {
            sendError(ws, 4004, 'Not in a lobby');
            return;
        }

        const updatedLobby = await setPlayerReady(lobby_id, ws.player_id, ready);

        broadcast(updatedLobby.players, 'LOBBY_STATE', lobbyStatePayload(updatedLobby));
    } catch (err) {
        sendError(ws, 5000, 'Failed to set ready state');
    }
}

async function handleStartGame(ws) {
    try {
        const lobby_id = await getPlayerLobby(ws.player_id);
        if (!lobby_id) {
            sendError(ws, 4004, 'Not in a lobby');
            return;
        }

        const lobby = await getLobby(lobby_id);
        if (!lobby) {
            sendError(ws, 4004, 'Lobby not found');
            return;
        }

        if (lobby.host_id !== ws.player_id) {
            sendError(ws, 4006, 'Not the host');
            return;
        }

        // Generate a unique session ID
        const session_id = `ses_${uuidv4().slice(0, 8)}`;
        const session_url = `${process.env.GAME_SERVICE_WS_URL}/sessions/${session_id}`;

        // Generate a unique token per player and store in Redis
        const tokens = {};
        for (const player of lobby.players) {
            const token = uuidv4();
            tokens[player.player_id] = token;
            await storeSessionToken(token, player.player_id, session_id);
        }

        // Tell the game service to create the session
        await fetch(`${process.env.GAME_SERVICE_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id,
                player_ids: lobby.players.map(p => p.player_id),
                duration_seconds: lobby.duration_minutes * 60
            })
        });

        // Broadcast GAME_STARTING to each player with their unique token
        for (const player of lobby.players) {
            const ws_player = clients.get(player.player_id);
            if (ws_player && ws_player.readyState === 1) {
                send(ws_player, 'GAME_STARTING', {
                    session_id,
                    session_url,
                    token: tokens[player.player_id],
                    expires_in: 30,
                    players: lobby.players.map(p => ({
                        player_id: p.player_id,
                        display_name: p.display_name,
                        player_data: p.player_data
                    }))
                });
            }
        }

        await deleteLobby(lobby_id, lobby.players.map(p => p.player_id));
    } catch (err) {
        sendError(ws, 5000, 'Failed to start game')
    }
}

async function handleLeaveLobby(ws) {
    try {
        const lobby_id = await getPlayerLobby(ws.player_id);
        if (!lobby_id) {
            return;
        }

        const lobby = await getLobby(lobby_id);
        if (!lobby) {
            return;
        }

        // If the host leaves, destroy the lobby and notify everyone
        if (lobby.host_id === ws.player_id) {
            await deleteLobby(lobby_id, lobby.players.map(p => p.player_id));

            // Notify all remaining players the lobby is closed
            const remaining = lobby.players.filter(p => p.player_id !== ws.player_id);
            broadcast(remaining, 'LOBBY_CLOSED', { reason: 'host_left' });
            return;
        }

        const updatedLobby = await removePlayer(lobby_id, ws.player_id);
        broadcast(updatedLobby.players, 'LOBBY_STATE', lobbyStatePayload(updatedLobby));
    } catch (err) {
        sendError(ws, 5000, 'Failed to leave lobby');
    }
}

async function handleDisconnect(ws) {
    if (!ws.player_id) {
        return;
    }

    clients.delete(ws.player_id);

    await handleLeaveLobby(ws);
}

module.exports = { handleMessage, handleDisconnect }
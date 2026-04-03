const redis = require('./redis');
const { v4: uuidv4 } = require('uuid');

const LOBBY_TTL = 3600; // 1 hour, lobbies auto expire from Redis if abandoned

async function createLobby({ player_id, display_name, name, max_players, duration_minutes, password_hash, player_data }) {
    const lobby_id = `lby_${uuidv4().slice(0, 8)}`

    const lobby = {
        lobby_id,
        name,
        max_players,
        duration_minutes,
        password_protected: !!password_hash,
        password_hash: password_hash || '',
        host_id: player_id,
        players: JSON.stringify([{
            player_id,
            display_name,
            ready: false,
            player_data: JSON.stringify(player_data)
        }])
    };

    // Store lobby as a Redis hash
    await redis.hset(`lobby:${lobby_id}`, lobby);
    await redis.expire(`lobby:${lobby_id}`, LOBBY_TTL);

    // Add to public lobby list if not password protected
    if (!password_hash) {
        await redis.sadd('lobby:list', lobby_id);
    }

    // Track which lobby this player is in
    await redis.set(`player:${player_id}:lobby`, lobby_id);

    return formatLobby(lobby);
}

async function getLobby(lobby_id) {
    const lobby = await redis.hgetall(`lobby:${lobby_id}`);

    if (!lobby || Object.keys(lobby).length === 0) {
        return null;
    }

    return formatLobby(lobby);
}

async function getPublicLobbies() {
    const lobby_ids = await redis.smembers('lobby:list');

    if (lobby_ids.length === 0) {
        return [];
    }

    // Fetch all lobbies
    const lobbies = await Promise.all(lobby_ids.map(id => getLobby(id)));

    // Filter out expired and deleted
    return lobbies.filter(Boolean).map(lobby => ({
        lobby_id: lobby.lobby_id,
        name: lobby.name,
        max_players: lobby.max_players,
        duration_minutes: lobby.duration_minutes,
        player_count: lobby.players.length,
        password_protected: lobby.password_protected
    }));
}

async function addPlayer(lobby_id, player_id, display_name, player_data) {
    const lobby = await getLobby(lobby_id);
    if (!lobby) {
        throw new Error('Lobby not found');
    }

    const players = lobby.players;
    players.push({
        player_id,
        display_name,
        ready: false,
        player_data: JSON.stringify(player_data)
    })

    // Update players list in Redis
    await redis.hset(`lobby:${lobby_id}`, 'players', JSON.stringify(players));
    await redis.expire(`lobby:${lobby_id}`, LOBBY_TTL);
    await redis.set(`player:${player_id}:lobby`, lobby_id);

    return { ...lobby, players };
}

async function removePlayer(lobby_id, player_id) {
    const lobby = await getLobby(lobby_id);
    if (!lobby) throw new Error('Lobby not found');

    const players = lobby.players.filter(p => p.player_id !== player_id);

    // Update players list in Redis
    await redis.hset(`lobby:${lobby_id}`, 'players', JSON.stringify(players));
    await redis.expire(`lobby:${lobby_id}`, LOBBY_TTL);
    await redis.del(`player:${player_id}:lobby`);

    return { ...lobby, players };
}

async function setPlayerReady(lobby_id, player_id, ready) {
    const lobby = await getLobby(lobby_id);
    if (!lobby) throw new Error('Lobby not found');

    const players = lobby.players.map(p =>
        p.player_id === player_id ? { ...p, ready } : p
    );

    await redis.hset(`lobby:${lobby_id}`, 'players', JSON.stringify(players));
    await redis.expire(`lobby:${lobby_id}`, LOBBY_TTL);

    return { ...lobby, players };
}

async function deleteLobby(lobby_id, player_ids) {
    await redis.del(`lobby:${lobby_id}`);
    await redis.srem('lobby:list', lobby_id);

    // Remove all player to lobby mappings
    await Promise.all(player_ids.map(id => redis.del(`player:${id}:lobby`)));
}

async function storeSessionToken(token, player_id, session_id) {
    await redis.set(
        `session:token:${token}`,
        JSON.stringify({ player_id, session_id }),
        'EX',
        30 // 30 second TTL
    );
}

async function getPlayerLobby(player_id) {
    return redis.get(`player:${player_id}:lobby`);
}

function formatLobby(raw) {
    const players = typeof raw.players === 'string' ? JSON.parse(raw.players) : raw.players

    return {
        lobby_id: raw.lobby_id,
        name: raw.name,
        max_players: parseInt(raw.max_players),
        duration_minutes: parseInt(raw.duration_minutes),
        password_protected: raw.password_protected === 'true' || raw.password_protected === true,
        password_hash: raw.password_hash,
        host_id: raw.host_id,
        players: players.map(p => ({
            ...p,
            player_data: typeof p.player_data === 'string' ? JSON.parse(p.player_data) : p.player_data
        }))
    };
}

module.exports = {
    createLobby,
    getLobby,
    getPublicLobbies,
    addPlayer,
    removePlayer,
    setPlayerReady,
    deleteLobby,
    storeSessionToken,
    getPlayerLobby
};
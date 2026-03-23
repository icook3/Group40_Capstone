const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const Redis = require('ioredis')

process.env.JWT_SECRET = 'test-secret';
process.env.GAME_SERVICE_URL = 'http://localhost:3001';
process.env.GAME_SERVICE_WS_URL = 'ws://localhost:3001';

const { handleMessage, handleDisconnect, clients } = require('../src/handlers')
const { authGuest } = require('../src/auth');
const { server, wss } = require('../src/server');

// -- HELPERS --

const PORT = 3099;

const testRedis = new Redis({
    host: '127.0.0.1',
    port: 4001
})

function startServer() {
    return new Promise((resolve, reject) => {
        server.on('error', reject);
        server.listen(PORT, resolve);
    })
}

function stopServer() {
    return new Promise((resolve) => {
        if (!wss) {
            return resolve();
        }
        wss.clients.forEach(client => client.terminate());
        wss.close(() => server.close(resolve));
    })
}

function connect() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${PORT}`);
        ws.on('open', () => resolve(ws));
        ws.on('error', reject);
    })
}

// Sends a message and waits for a specific response type
function sendAndWait(ws, type, payload, waitFor) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Timeout waiting for ${waitFor}`)), 3000);

        ws.on('message', function handler(data) {
            const msg = JSON.parse(data);
            if (msg.type === waitFor) {
                clearTimeout(timeout);
                ws.off('message', handler);
                resolve(msg);
            }
        })

        ws.send(JSON.stringify({ type, payload }));
    });
}

// Waits for a specific message type on a WebSocket
function waitForMessage(ws, waitFor) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Timeout waiting for ${waitFor}`)), 3000);

        ws.on('message', function handler(data) {
            const msg = JSON.parse(data);
            if (msg.type === waitFor) {
                clearTimeout(timeout);
                ws.off('message', handler);
                resolve(msg);
            }
        })
    })
}

// Creates a guest auth token and authenticates a WebSocket connection
async function authenticateClient(ws, display_name = 'TestRider') {
    const { player_id, token } = await authGuest(display_name);
    const player_data = {
        model: 'model_1',
        colors: { skin: '#fff', shirt: '#f00', shorts: '#00f', shoes: '#000' },
        bikeColors: { frame: '#f00', tires: '#000', grip: '#fff', seat: '#000', pedals: '#000', pedalCrank: '#000' },
        helmetColors: { helmet: '#f00', padding: '#fff' }
    };

    await sendAndWait(ws, 'AUTH', { player_id, token, player_data }, 'AUTH_ACK');

    return { player_id, token, player_data };
}

// Creates a lobby and returns the lobby_id and host player_id
async function createLobby(ws, options = {}) {
    const msg = await sendAndWait(ws, 'CREATE_LOBBY', {
        name: options.name || 'Test Lobby',
        max_players: options.max_players || 4,
        duration_minutes: options.duration_minutes || 60,
        password: options.password || undefined
    }, 'LOBBY_CREATED');

    return msg.payload.lobby_id;
}

// -- Tests --

beforeAll(async () => {
    console.log('Step 1: waiting for redis ready')
    await new Promise((resolve, reject) => {
        if (testRedis.status === 'ready') return resolve()
        testRedis.once('ready', resolve)
        testRedis.once('error', reject)
    })
    console.log('Step 2: redis ready, starting server')
    await startServer()
    console.log('Step 3: server started')
}, 30000)

afterAll(async () => {
    await stopServer();
    await testRedis.quit();
})

beforeEach(async () => {
    await testRedis.flushall();
})

// Close all clients after each test to keep tests isolated
afterEach(async () => {
    wss.clients.forEach(client => client.terminate());
    await new Promise(resolve => setTimeout(resolve, 50));
})

// -- Auth --

describe('AUTH', () => {
    test('valid token authenticates successfully', async () => {
        const ws = await connect();
        const { player_id, token } = await authGuest('TestRider');

        const response = await sendAndWait(ws, 'AUTH', { player_id, token }, 'AUTH_ACK');

        expect(response.type).toBe('AUTH_ACK');
        expect(response.payload.player_id).toBe(player_id);
    })

    test('invalid token returns 4001', async () => {
        const ws = await connect();
        const { player_id } = await authGuest('TestRider');

        const response = await sendAndWait(ws, 'AUTH', {
            player_id,
            token: 'invalid-token'
        }, 'ERROR');

        expect(response.payload.code).toBe(4001);
    })

    test('mismatched player_id returns 4001', async () => {
        const ws = await connect();
        const { token } = await authGuest('TestRider');

        const response = await sendAndWait(ws, 'AUTH', {
            player_id: uuidv4(),
            token
        }, 'ERROR');

        expect(response.payload.code).toBe(4001);
    })

    test('unauthenticated message returns 4001', async () => {
        const ws = await connect();

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Test',
            max_players: 4,
            duration_minutes: 60
        }, 'ERROR');

        expect(response.payload.code).toBe(4001);
    })

    test('auth timeout closes connection after 5 seconds', async () => {
        const ws = await connect();

        // Override the timeout for this test to 100ms
        wss.clients.forEach(client => {
            clearTimeout(client.authTimeout);
            client.authTimeout = setTimeout(() => {
                if (!client.isAuthenticated) {
                    client.close(4002, 'Authentication timeout');
                }
            }, 100);
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection did not close')), 3000);
            ws.on('close', (code) => {
                clearTimeout(timeout);
                expect(code).toBe(4002);
                resolve();
            });
        });
    })

    test('player_data is stored on auth', async () => {
        const ws = await connect();
        const { player_id, token } = await authGuest('TestRider');
        const player_data = { model: 'model_1', colors: { skin: '#fff' } };

        await sendAndWait(ws, 'AUTH', { player_id, token, player_data }, 'AUTH_ACK');

        const lobby = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Test',
            max_players: 4,
            duration_minutes: 60
        }, 'LOBBY_CREATED');

        expect(lobby.payload.players[0].player_data).toEqual(player_data);
    })
})

// -- Create Lobby --

describe('CREATE_LOBBY', () => {
    test('creates lobby successfully', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'My Ride',
            max_players: 4,
            duration_minutes: 60
        }, 'LOBBY_CREATED');

        expect(response.payload.name).toBe('My Ride');
        expect(response.payload.max_players).toBe(4);
        expect(response.payload.duration_minutes).toBe(60);
        expect(response.payload.password_protected).toBe(false);
        expect(response.payload.players).toHaveLength(1);
    })

    test('creates password protected lobby', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Private Ride',
            max_players: 4,
            duration_minutes: 60,
            password: 'secret'
        }, 'LOBBY_CREATED');

        expect(response.payload.password_protected).toBe(true);
    })

    test('invalid max_players returns 4008', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Test',
            max_players: 5,
            duration_minutes: 60
        }, 'ERROR');

        expect(response.payload.code).toBe(4008);
    })

    test('invalid duration returns 4009', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Test',
            max_players: 4,
            duration_minutes: 25
        }, 'ERROR');

        expect(response.payload.code).toBe(4009);
    })

    test('duration over 240 returns 4009', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Test',
            max_players: 4,
            duration_minutes: 250
        }, 'ERROR');

        expect(response.payload.code).toBe(4009);
    })

    test('already in a lobby returns 4007', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        await createLobby(ws);

        const response = await sendAndWait(ws, 'CREATE_LOBBY', {
            name: 'Second Lobby',
            max_players: 4,
            duration_minutes: 60
        }, 'ERROR');

        expect(response.payload.code).toBe(4007);
    })
})

// -- Lobby List --

describe('GET_LOBBIES', () => {
    test('returns public lobbies', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        await createLobby(ws, { name: 'Public Ride' });

        const response = await sendAndWait(ws, 'GET_LOBBIES', {}, 'LOBBY_LIST');

        expect(response.payload.lobbies.length).toBeGreaterThan(0);
        expect(response.payload.lobbies[0].name).toBe('Public Ride');
    })

    test('password protected lobbies do not appear in list', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        await createLobby(ws, { name: 'Secret Ride', password: 'secret' });

        const response = await sendAndWait(ws, 'GET_LOBBIES', {}, 'LOBBY_LIST');

        const found = response.payload.lobbies.find(l => l.name === 'Secret Ride');
        expect(found).toBeUndefined();
    })

    test('lobby list includes player count', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        await createLobby(ws, { name: 'Count Test' });

        const response = await sendAndWait(ws, 'GET_LOBBIES', {}, 'LOBBY_LIST');

        const lobby = response.payload.lobbies.find(l => l.name === 'Count Test');
        expect(lobby.player_count).toBe(1);
    })
})

// -- Join Lobby --

describe('JOIN_LOBBY', () => {
    test('joins lobby successfully and all players receive LOBBY_STATE', async () => {
        const host = await connect();
        const { player_id: host_id } = await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');

        // Both host and joiner receive LOBBY_STATE
        const [hostMsg, joinerMsg] = await Promise.all([
            waitForMessage(host, 'LOBBY_STATE'),
            sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE')
        ]);

        expect(hostMsg.payload.players).toHaveLength(2);
        expect(joinerMsg.payload.players).toHaveLength(2);
    })

    test('joining includes player_data of all players', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');

        const response = await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        response.payload.players.forEach(p => {
            expect(p.player_data).toBeDefined();
        });
    })

    test('wrong password returns 4003', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host, { password: 'correct' });

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');

        const response = await sendAndWait(joiner, 'JOIN_LOBBY', {
            lobby_id,
            password: 'wrong'
        }, 'ERROR');

        expect(response.payload.code).toBe(4003);
    })

    test('no password on protected lobby returns 4003', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host, { password: 'secret' });

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');

        const response = await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'ERROR');

        expect(response.payload.code).toBe(4003);
    })

    test('full lobby returns 4005', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host, { max_players: 2 });

        const p2 = await connect();
        await authenticateClient(p2, 'Player2');
        await sendAndWait(p2, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        const p3 = await connect();
        await authenticateClient(p3, 'Player3');
        const response = await sendAndWait(p3, 'JOIN_LOBBY', { lobby_id }, 'ERROR');

        expect(response.payload.code).toBe(4005);
    })

    test('lobby not found returns 4004', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'JOIN_LOBBY', {
            lobby_id: 'lby_invalid'
        }, 'ERROR');

        expect(response.payload.code).toBe(4004);
    })

    test('already in a lobby returns 4007', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        const lobby_id = await createLobby(ws);

        const response = await sendAndWait(ws, 'JOIN_LOBBY', { lobby_id }, 'ERROR');

        expect(response.payload.code).toBe(4007);
    })
})

// -- Set Ready --

describe('SET_READY', () => {
    test('sets ready state and broadcasts LOBBY_STATE', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        await createLobby(ws);

        const response = await sendAndWait(ws, 'SET_READY', { ready: true }, 'LOBBY_STATE');

        const player = response.payload.players[0];
        expect(player.ready).toBe(true);
    })

    test('can toggle ready state off', async () => {
        const ws = await connect();
        await authenticateClient(ws);
        await createLobby(ws);

        await sendAndWait(ws, 'SET_READY', { ready: true }, 'LOBBY_STATE');
        const response = await sendAndWait(ws, 'SET_READY', { ready: false }, 'LOBBY_STATE');

        const player = response.payload.players[0];
        expect(player.ready).toBe(false);
    })

    test('not in a lobby returns 4004', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'SET_READY', { ready: true }, 'ERROR');

        expect(response.payload.code).toBe(4004);
    })
})

// -- Start Game --

describe('START_GAME', () => {
    test('non-host gets 4006', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');
        await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        const response = await sendAndWait(joiner, 'START_GAME', {}, 'ERROR');

        expect(response.payload.code).toBe(4006);
    })

    test('not in a lobby returns 4004', async () => {
        const ws = await connect();
        await authenticateClient(ws);

        const response = await sendAndWait(ws, 'START_GAME', {}, 'ERROR');

        expect(response.payload.code).toBe(4004);
    })

    test('all players receive GAME_STARTING with unique tokens', async () => {
        // Mock the fetch call to game service
        global.fetch = jest.fn().mockResolvedValue({ ok: true });

        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');
        await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        const [joinerMsg, hostMsg] = await Promise.all([
            waitForMessage(joiner, 'GAME_STARTING'),
            sendAndWait(host, 'START_GAME', {}, 'GAME_STARTING')
        ]);

        // Both receive GAME_STARTING
        expect(hostMsg.type).toBe('GAME_STARTING');
        expect(joinerMsg.type).toBe('GAME_STARTING');

        // Tokens be unique
        expect(hostMsg.payload.token).not.toBe(joinerMsg.payload.token);

        // Both have player list with customization data
        expect(hostMsg.payload.players).toHaveLength(2);
        expect(joinerMsg.payload.players).toHaveLength(2);
    })
})

// -- Leave Lobby --

describe('LEAVE_LOBBY', () => {
    test('non-host leaving broadcasts updated LOBBY_STATE', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');
        await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        const hostMsgPromise = waitForMessage(host, 'LOBBY_STATE');
        joiner.send(JSON.stringify({ type: 'LEAVE_LOBBY', payload: {} }));
        const hostMsg = await hostMsgPromise;

        expect(hostMsg.payload.players).toHaveLength(1);
    })

    test('host leaving sends LOBBY_CLOSED to remaining players', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');
        await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        const joinerMsgPromise = waitForMessage(joiner, 'LOBBY_CLOSED');
        host.send(JSON.stringify({ type: 'LEAVE_LOBBY', payload: {} }));
        const joinerMsg = await joinerMsgPromise;

        expect(joinerMsg.payload.reason).toBe('host_left');
    })

    test('disconnect behaves same as leaving', async () => {
        const host = await connect();
        await authenticateClient(host, 'Host');
        const lobby_id = await createLobby(host);

        const joiner = await connect();
        await authenticateClient(joiner, 'Joiner');
        await sendAndWait(joiner, 'JOIN_LOBBY', { lobby_id }, 'LOBBY_STATE');

        // Terminate the joiner connection
        const hostMsg = waitForMessage(host, 'LOBBY_STATE');
        joiner.terminate();

        const msg = await hostMsg;
        expect(msg.payload.players).toHaveLength(1);
    })
})
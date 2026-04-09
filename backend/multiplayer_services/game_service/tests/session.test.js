const WebSocket = require('ws');
const Redis = require('ioredis');
const { encode, decode, MSG } = require('../src/packet');
const { createSession, sessions } = require('../src/session');
const { server, wss } = require('../src/server');

process.env.REDIS_HOST = '127.0.0.1';
process.env.REDIS_PORT = '4002';

const PORT = 14001;

const testRedis = new Redis({
    host: '127.0.0.1',
    port: 4002
});

// -- Helpers --

function startServer() {
    return new Promise((resolve, reject) => {
        server.on('error', reject);
        server.listen(PORT, resolve);
    });
}

function stopServer() {
    return new Promise((resolve) => {
        try {
            if (!wss || !server) {
                return resolve();
            }
            wss.clients.forEach(client => client.terminate());
            wss.close(() => server.close(resolve));
        } catch (err) {
            resolve();
        }
    })
}

function connect(session_id, token) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${PORT}/sessions/${session_id}?token=${token}`);
        ws.on('open', () => resolve(ws));
        ws.on('error', reject);
    })
}

// Waits for a binary packet of a specific msg type
function waitForPacket(ws, msgType) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            ws.off('message', handler);
            reject(new Error(`Timeout waiting for msg type 0x0${msgType}`));
        }, 3000);

        function handler(data) {
            const buf = Buffer.from(data);
            const type = buf.readUInt8(0);
            if (type === msgType) {
                clearTimeout(timeout);
                ws.off('message', handler);
                resolve(buf);
            }
        }

        ws.setMaxListeners(20);
        ws.on('message', handler);
    })
}

// Creates a session and stores a valid token in Redis
async function setupSession(options = {}) {
    const session_id = `ses_test_${Date.now()}`;
    const player_id = `player_${Date.now()}`;
    const token = `token_${Date.now()}`;
    const duration_seconds = options.duration_seconds || 600;
    const player_ids = options.player_ids || [player_id];

    await createSession(session_id, player_ids, duration_seconds);

    await testRedis.set(
        `session:token:${token}`,
        JSON.stringify({ player_id, session_id }),
        'EX',
        30
    );

    return { session_id, player_id, token, duration_seconds };
}

// -- Tests --

beforeAll(async () => {
    await new Promise((resolve, reject) => {
        if (testRedis.status === 'ready') return resolve();
        testRedis.once('ready', resolve);
        testRedis.once('error', reject);
    })
    await startServer();
}, 30000);

afterAll(async () => {
    await stopServer();
    await testRedis.quit();
});

beforeEach(async () => {
    await testRedis.flushall();
    sessions.clear();
});

afterEach(() => {
    wss.clients.forEach(client => client.terminate());
});

// -- Connection and SESSION_JOIN --

describe('CONNECTION', () => {
    test('valid token receives SESSION_JOIN', async () => {
        const { session_id, token, duration_seconds } = await setupSession();
        const ws = await connect(session_id, token);

        const buf = await waitForPacket(ws, MSG.SESSION_JOIN);

        expect(buf.readUInt8(0)).toBe(MSG.SESSION_JOIN);
        expect(buf.readUInt8(7)).toBe(1); // player_id slot 1
        expect(buf.readUInt8(8)).toBe(1); // player_count
        expect(buf.readUInt16BE(9)).toBe(duration_seconds);
    });

    test('invalid token closes connection with error', async () => {
        const { session_id } = await setupSession();
        const ws = await connect(session_id, 'invalid-token');

        const buf = await waitForPacket(ws, MSG.ERROR);

        expect(buf.readUInt8(0)).toBe(MSG.ERROR);
        expect(buf.readUInt8(7)).toBe(0x01); // invalid token error code
    });

    test('token for wrong session closes connection with error', async () => {
        const { token } = await setupSession();

        // Connect to a different session with a token for the first
        const other_session_id = 'other_session';
        await createSession(other_session_id, ['player_other'], 600);

        const ws = await connect(other_session_id, token);
        const buf = await waitForPacket(ws, MSG.ERROR);

        expect(buf.readUInt8(7)).toBe(0x01);
    });

    test('token cannot be reused', async () => {
        const { session_id, token } = await setupSession();

        // First connection
        const ws1 = await connect(session_id, token);
        await waitForPacket(ws1, MSG.SESSION_JOIN);

        // Second connection with same token, should fail
        const ws2 = await connect(session_id, token);
        const buf = await waitForPacket(ws2, MSG.ERROR);

        expect(buf.readUInt8(7)).toBe(0x01);
    });

    test('session not found returns error', async () => {
        // Store a token pointing to a non-existent session
        await testRedis.set(
            'session:token:fake-token',
            JSON.stringify({ player_id: 'p1', session_id: 'not_a_session' }),
            'EX',
            30
        );

        const ws = await connect('not_a_session', 'fake-token');
        const buf = await waitForPacket(ws, MSG.ERROR);

        expect(buf.readUInt8(7)).toBe(0x02);
    });

    test('slot assignment is correct for multiple players', async () => {
        const session_id = `ses_multi_${Date.now()}`;
        const player1_id = `p1_${Date.now()}`;
        const player2_id = `p2_${Date.now()}`;
        const token1 = `t1_${Date.now()}`;
        const token2 = `t2_${Date.now()}`;

        await createSession(session_id, [player1_id, player2_id], 600);

        await testRedis.set(
            `session:token:${token1}`,
            JSON.stringify({ player_id: player1_id, session_id }),
            'EX', 30
        );
        await testRedis.set(
            `session:token:${token2}`,
            JSON.stringify({ player_id: player2_id, session_id }),
            'EX', 30
        );

        const ws1 = await connect(session_id, token1)
        const buf1 = await waitForPacket(ws1, MSG.SESSION_JOIN)

        const ws2 = await connect(session_id, token2)
        const buf2 = await waitForPacket(ws2, MSG.SESSION_JOIN)

        expect(buf1.readUInt8(7)).toBe(1); // slot 1
        expect(buf2.readUInt8(7)).toBe(2); // slot 2
        expect(buf1.readUInt8(8)).toBe(2); // player_count 2
        expect(buf2.readUInt8(8)).toBe(2); // player_count 2
    });
});

// -- RIDER_INPUT --

describe('RIDER_INPUT', () => {
    test('server accepts RIDER_INPUT without error', async () => {
        const { session_id, token } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        const input = encode.riderInput(1, 250, 325, 15000, 8000);
        ws.send(input);

        // No error should be received, wait and check
        await new Promise(resolve => setTimeout(resolve, 300));
        expect(ws.readyState).toBe(WebSocket.OPEN);
    });

    test('RIDER_INPUT updates rider state in session', async () => {
        const { session_id, token, player_id } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        const input = encode.riderInput(1, 250, 325, 15000, 8000);
        ws.send(input);

        // Give the server a tick to process
        await new Promise(resolve => setTimeout(resolve, 100));

        const session = sessions.get(session_id);
        const player = session.players.get(player_id);

        expect(player.power).toBe(250);
        expect(player.speed).toBe(325);
        expect(player.x).toBe(15000);
        expect(player.y).toBe(8000);
    });
});

// -- WORLD_STATE --

describe('WORLD_STATE', () => {
    test('client receives WORLD_STATE after connecting', async () => {
        const { session_id, token } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        // Wait for first tick
        const buf = await waitForPacket(ws, MSG.WORLD_STATE);

        expect(buf.readUInt8(0)).toBe(MSG.WORLD_STATE);
        expect(buf.readUInt8(7)).toBe(1); // rider_count
    });

    test('WORLD_STATE contains correct rider data after input', async () => {
        const { session_id, token } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        // Send input and wait for next world state
        const input = encode.riderInput(1, 300, 400, 10000, 5000);
        ws.send(input);

        // Wait for a world state that reflects our input
        let buf;
        for (let i = 0; i < 5; i++) {
            buf = await waitForPacket(ws, MSG.WORLD_STATE);
            const power = buf.readUInt16BE(9);
            if (power === 300) {
                break;
            }
        }

        const riderCount = buf.readUInt8(7);
        expect(riderCount).toBe(1);

        // Rider data starts at offset 8
        // player_id(1) + power(2) + speed(2) + x(4) + y(4)
        expect(buf.readUInt8(8)).toBe(1); // slot 1
        expect(buf.readUInt16BE(9)).toBe(300); // power
        expect(buf.readUInt16BE(11)).toBe(400); // speed
        expect(buf.readInt32BE(13)).toBe(10000); // x
        expect(buf.readInt32BE(17)).toBe(5000); // y
    });
});

// -- HEARTBEAT --

describe('HEARTBEAT', () => {
    test('server accepts HEARTBEAT without error', async () => {
        const { session_id, token } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        // HEARTBEAT is just the 7 byte header with msg type 0x05
        const buf = Buffer.allocUnsafe(7);
        buf.writeUInt8(MSG.HEARTBEAT, 0);
        buf.writeUInt32BE(0, 1);
        buf.writeUInt16BE(0, 5);
        ws.send(buf);

        await new Promise(resolve => setTimeout(resolve, 100));
        expect(ws.readyState).toBe(WebSocket.OPEN);
    });

    test('HEARTBEAT updates lastSeen', async () => {
        const { session_id, token, player_id } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        const session = sessions.get(session_id);
        const before = session.players.get(player_id).lastSeen;

        await new Promise(resolve => setTimeout(resolve, 100));

        const buf = Buffer.allocUnsafe(7);
        buf.writeUInt8(MSG.HEARTBEAT, 0);
        buf.writeUInt32BE(0, 1);
        buf.writeUInt16BE(0, 5);
        ws.send(buf);

        await new Promise(resolve => setTimeout(resolve, 100));

        const after = session.players.get(player_id).lastSeen;
        expect(after).toBeGreaterThan(before);
    });
});

// -- SESSION_END --

describe('SESSION_END', () => {
    test('session ends when duration is reached', async () => {
        const { session_id, token } = await setupSession({ duration_seconds: 1 });
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        const buf = await waitForPacket(ws, MSG.SESSION_END);

        expect(buf.readUInt8(0)).toBe(MSG.SESSION_END);
        expect(buf.readUInt8(7)).toBe(0x01); // duration reached
    }, 8000);

    test('session ends when last player disconnects', async () => {
        const { session_id, token } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        ws.terminate();

        // Session should be cleaned up
        await new Promise(resolve => setTimeout(resolve, 300));
        expect(sessions.has(session_id)).toBe(false);
    });

    test('session is removed from memory after ending', async () => {
        const { session_id, token } = await setupSession({ duration_seconds: 1 });
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        await waitForPacket(ws, MSG.SESSION_END);

        expect(sessions.has(session_id)).toBe(false);
    }, 8000);
});

// -- Malformed packets --

describe('MALFORMED', () => {
    test('malformed packet returns error', async () => {
        const { session_id, token } = await setupSession();
        const ws = await connect(session_id, token);
        await waitForPacket(ws, MSG.SESSION_JOIN);

        // Send invalid packet (too small to be valid)
        ws.send(Buffer.from([0x02, 0x00]));

        const buf = await waitForPacket(ws, MSG.ERROR);
        expect(buf.readUInt8(7)).toBe(0x04); // malformed packet
    })
})
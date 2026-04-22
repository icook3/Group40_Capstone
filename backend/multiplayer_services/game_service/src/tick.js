const { encode, nextTick } = require('./packet')

const TICK_RATE_MS = 50 // 20hz
const HEARTBEAT_TIMEOUT_MS = 15000 // 15 seconds

function startTick(session, onDurationReached) {
    return setInterval(() => {
        tick(session, onDurationReached)
    }, TICK_RATE_MS)
}

function stopTick(session) {
    if (session.tick_interval) {
        clearInterval(session.tick_interval)
        session.tick_interval = null
    }
}

function tick(session, onDurationReached) {
    const now = Date.now()

    // Check if ride duration has been reached
    const elapsed = (now - session.started_at) / 1000
    if (elapsed >= session.duration_seconds) {
        onDurationReached()
        return
    }

    // Drop players who haven't sent input or heartbeat in HEARTBEAT_TIMEOUT_MS
    for (const [player_id, player] of session.players) {
        if (now - player.lastSeen > HEARTBEAT_TIMEOUT_MS) {
            player.ws.terminate()
            session.players.delete(player_id)
        }
    }

    if (session.players.size === 0) {
        return;
    }

    // Build rider array from current session state
    const riders = []
    for (const player of session.players.values()) {
        riders.push({
            player_id: session.slots[player.player_id],
            power: player.power,
            speed: player.speed,
            x: player.x,
            y: player.y
        })
    }

    // Send to everyone
    const tickId = nextTick()
    const packet = encode.worldState(riders, tickId)

    for (const player of session.players.values()) {
        if (player.ws.readyState === 1) {
            player.ws.send(packet)
        }
    }
}

module.exports = { startTick, stopTick }
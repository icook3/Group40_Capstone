
if (!window.APP_CONFIG) {
    throw new Error("APP_CONFIG missing. Ensure config.js is loaded.");
}

const config = Object.freeze(window.APP_CONFIG);

validateConfig(config);

function validateConfig(cfg) {
    // Peer to peer validation
    if (cfg.PEER_HOST) {
        if (!cfg.PEER_PORT) {
            throw new Error("PEER_PORT required when PEER_HOST is set.");
        }
        if (!cfg.PEER_PATH) {
            throw new Error("PEER_PATH required when PEER_HOST is set.");
        }
    }

    // Multiplayer validation
    if (cfg.LOBBY_HTTP_URL || cfg.LOBBY_WS_URL) {
        if (!cfg.LOBBY_HTTP_URL) {
            throw new Error("LOBBY_URL required when LOBBY_WS_URL is set.");
        }
        if (!cfg.LOBBY_WS_URL) {
            throw new Error("LOBBY_WS_URL required when LOBBY_URL is set.");
        }

        if (!isValidHttpUrl(cfg.LOBBY_HTTP_URL)) {
            throw new Error("LOBBY_URL must be a valid HTTP or HTTPS URL.");
        }
        if (!isValidWsUrl(cfg.LOBBY_WS_URL)) {
            throw new Error("LOBBY_WS_URL must be a valid WS or WSS URL.");
        }
    }

    // Strava validation
    if (cfg.STRAVA_BACKEND_URL && !cfg.STRAVA_CLIENT_ID) {
        throw new Error("STRAVA_CLIENT_ID required when STRAVA_BACKEND_URL is set.");
    }

    if (cfg.STRAVA_BACKEND_URL && !isValidHttpUrl(cfg.STRAVA_BACKEND_URL)) {
        throw new Error("STRAVA_BACKEND_URL must be a valid HTTP or HTTPS URL.");
    }

    // Crash reporter validation
    if (cfg.CRASH_REPORTER_BACKEND_URL && !isValidHttpUrl(cfg.CRASH_REPORTER_BACKEND_URL)) {
        throw new Error("CRASH_REPORTER_BACKEND_URL must be a valid HTTP or HTTPS URL.");
    }
}

function isValidHttpUrl(value) {
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

function isValidWsUrl(value) {
    try {
        const url = new URL(value)
        return url.protocol === 'ws:' || url.protocol === 'wss:'
    } catch {
        return false
    }
}

export default config;
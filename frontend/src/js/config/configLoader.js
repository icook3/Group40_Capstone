
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

    // Strava validation
    if (cfg.STRAVA_BACKEND_URL && !cfg.STRAVA_CLIENT_ID) {
        throw new Error("STRAVA_CLIENT_ID required when STRAVA_BACKEND_URL is set.");
    }

    if (cfg.STRAVA_BACKEND_URL && !isValidUrl(cfg.STRAVA_BACKEND_URL)) {
        throw new Error("STRAVA_BACKEND_URL must be a valid URL.");
    }

    // Crash reporter validation
    if (cfg.CRASH_REPORTER_BACKEND_URL && !isValidUrl(cfg.CRASH_REPORTER_BACKEND_URL)) {
        throw new Error("CRASH_REPORTER_BACKEND_URL must be a valid URL.");
    }
}

function isValidUrl(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

export default config;

// All service variables must remain defined.
// Use null for services that are not configured in this environment.
window.APP_CONFIG = window.APP_CONFIG || {
    // Peer to Peer multiplayer configuration variables
    PEER_HOST: null, // Example: "127.0.0.1"
    PEER_PATH: null, // Example: "/peerServer"
    PEER_PORT: null, // Example: "9000"

    // Full multiplayer experience configuration variables
    LOBBY_HTTP_URL: "https://commercial-jay-recovery-reunion.trycloudflare.com", // Example: "http://YOUR-BACKEND.com"
    LOBBY_WS_URL: "ws://localhost:4000", // Example: "ws://YOUR-BACKEND.com"

    // Strava configuration variables
    STRAVA_CLIENT_ID: null, // Example: 12345
    STRAVA_BACKEND_URL: null, // Example: "https://YOUR-BACKEND.com"

    // Crash Reporter configuration variables
    CRASH_REPORTER_BACKEND_URL: null, // Example: "https://YOUR-BACKEND.com"
};
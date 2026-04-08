
// All service variables must remain defined.
// Use null for services that are not configured in this environment.
window.APP_CONFIG = window.APP_CONFIG || {
    // Peer to Peer multiplayer configuration variables
    PEER_HOST: "127.0.0.1", // Example: "127.0.0.1"
    PEER_PATH: "/peerServer", // Example: "/peerServer"
    PEER_PORT: "9000", // Example: "9000"

    // Strava configuration variables
    STRAVA_CLIENT_ID: null, // Example: 12345
    STRAVA_BACKEND_URL: null, // Example: "https://YOUR-BACKEND.com"

    // Crash Reporter configuration variables
    CRASH_REPORTER_BACKEND_URL: null, // Example: "https://YOUR-BACKEND.com"
};
import config from "../config/configLoader.js";

/* ------------------------------------------------------- */
/* All Lobby WS Protocol is in the lobby_service README.md */
/* ------------------------------------------------------- */

export class LobbyClient {
    constructor() {
        this.ws = null;
        this.token = null;
        this.playerId = null;
        this.displayName = null;
        this.playerData = null;
        this.LOBBY_WS_URL = config.LOBBY_WS_URL;
        this.handlers = new Map();
    }

    connect(token, playerId, displayName, playerData) {
        return new Promise((resolve, reject) => {
            this.token = token;
            this.playerId = playerId;
            this.displayName = displayName;
            this.playerData = playerData;

            this.ws = new WebSocket(this.LOBBY_WS_URL);

            // Send AUTH immediately on connection (must arrive within 5 seconds of connection with backend)
            this.ws.onopen = () => {
              this.send("AUTH", {
                 player_id: this.playerId,
                 token: this.token,
                 player_data: this.playerData
              });
            };

            // Receive AUTH_ACK
            this.ws.onmessage = (event) => {
                try {
                    const { type, payload } = JSON.parse(event.data);

                    // Resolve the connect promise
                    if (type === "AUTH_ACK") {
                        resolve(payload);
                    }

                    // Route to registered handlers
                    const handler = this.handlers.get(type);
                    if (handler) {
                        handler(payload);
                    }
                } catch (err) {
                    console.error("LobbyClient message error:", err)
                }
            };

            this.ws.onerror = (err) => {
                reject(new Error("Failed to connect to WS lobby service"));
            };

            this.ws.onclose = () => {
                const handler = this.handlers.get("DISCONNECTED");
                if (handler) {
                    handler();
                }
            };
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    send(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        } else {
            console.warn("LobbyClient tried to send while not connected");
        }
    }

    // Register a handler for a specific message type
    on(messageType, handler) {
        this.handlers.set(messageType, handler);
    }

    // Remove a handler
    off(messageType) {
        this.handlers.delete(messageType);
    }

    createLobby(name, maxPlayers, durationMinutes, password) {
        const payload = {
            name: name,
            max_players: maxPlayers,
            duration_minutes: durationMinutes,
            password: password || undefined
        };

        this.send("CREATE_LOBBY", payload);
    }

    getLobbies() {
        this.send("GET_LOBBIES", {});
    }

    joinLobby(lobbyId, password) {
        const payload = {
            lobby_id: lobbyId,
            password: password || undefined
        };

        this.send("JOIN_LOBBY", payload);
    }

    setReady(ready) {
        const payload = {
            ready: ready
        };

        this.send("SET_READY", payload);
    }
    startGame() {
        this.send("START_GAME", {});
    }

    leaveLobby() {
        this.send("LEAVE_LOBBY", {});
    }
}
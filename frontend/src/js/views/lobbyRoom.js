import { getStoredAuth } from "../multiplayer/multiplayerAuth.js";
import { constants } from "../constants.js";

export class lobbyRoomView {
    content;
    ready = false;
    lobbyClient = null;
    isHost = false;
    currentLobby = null;

    constructor(setWhenDone) {
        fetch("../html/lobbyRoom.html")
            .then((r) => r.text())
            .then((content) => {
                this.content = content;
                if (setWhenDone) {
                    this.setPage();
                }
                this.ready = true;
            });
    }

    setPage() {
        document.getElementById("mainDiv").innerHTML = this.content;

        // Get lobby data and auth from session storage
        const auth = getStoredAuth();
        const lobbyData = JSON.parse(sessionStorage.getItem("currentLobby"));

        if (!lobbyData || !auth) {
            window.viewManager.setView(window.viewManager.views.lobbyBrowser);
            return;
        }

        this.currentLobby = lobbyData;
        this.isHost = lobbyData.host_id === auth.player_id;

        // Get shared lobby client from lobby browser
        this.lobbyClient = window.__lobbyClient;

        if (!this.lobbyClient) {
            console.error("No lobby client found");
            window.viewManager.setView(window.viewManager.views.mainMenu);
            return;
        }

        this.initUI(auth, lobbyData);
        this.initHandlers(auth);
        this.renderLobby(lobbyData, auth);
    }

    initUI(auth, lobby) {
        // Header
        document.getElementById("lobby-room-name").textContent = lobby.name;
        document.getElementById("lobby-room-meta").textContent =
            `${lobby.duration_minutes} min · ${lobby.max_players} players max`;
        document.getElementById("lobby-room-player-name").textContent = auth.display_name;

        // Show start button for host only
        const startBtn = document.getElementById("start-game-btn");
        if (this.isHost) {
            startBtn.classList.remove("hidden");
        }

        // Set grid layout based on max_players
        const grid = document.getElementById("player-grid");
        grid.className = `player-grid grid-${lobby.max_players}`;
    }

    initHandlers(auth) {
        // Register lobby state updates
        this.lobbyClient.on("LOBBY_STATE", (payload) => {
            sessionStorage.setItem("currentLobby", JSON.stringify(payload));
            this.currentLobby = payload;
            this.renderLobby(payload, auth);
        });

        this.lobbyClient.on("LOBBY_CLOSED", () => {
            alert("The host has left. The lobby has been closed.");
            window.viewManager.setView(window.viewManager.views.lobbyBrowser);
        });

        this.lobbyClient.on("GAME_STARTING", (payload) => {
            sessionStorage.setItem("gameStarting", JSON.stringify(payload));

            // Set track scale based on max_players from current lobby
            const maxPlayers = this.currentLobby.max_players;
            constants.multiplayerTrackScale = maxPlayers / 2;

            // Disconnect from lobby service
            // Game service connection handled by MultiplayerManager in zlow.js
            this.lobbyClient.disconnect();
            window.__lobbyClient = null;

            window.viewManager.setView(window.viewManager.views.mainZlow);
        });

        // Ready toggle — clicking your own slot toggles ready
        document.getElementById("player-grid").addEventListener("click", (e) => {
            const slot = e.target.closest(".player-slot.own-slot");
            if (!slot) return;
            const isReady = slot.classList.contains("ready");
            this.lobbyClient.setReady(!isReady);
        });

        // Start game
        document.getElementById("start-game-btn").addEventListener("click", () => {
            this.lobbyClient.startGame();
        });

        // Leave lobby
        document.getElementById("leave-lobby-btn").addEventListener("click", () => {
            this.showLeaveConfirm();
        });

        document.getElementById("leave-cancel-btn").addEventListener("click", () => {
            document.getElementById("leave-confirm-overlay").classList.remove("visible");
        });

        document.getElementById("leave-confirm-btn").addEventListener("click", () => {
            this.lobbyClient.leaveLobby();
            window.viewManager.setView(window.viewManager.views.lobbyBrowser);
        });
    }

    showLeaveConfirm() {
        const overlay = document.getElementById("leave-confirm-overlay");
        const msg = document.getElementById("leave-confirm-msg");

        if (this.isHost) {
            document.getElementById("leave-confirm-title").textContent = "Destroy lobby?";
            msg.textContent = "You are the host. Leaving will destroy the lobby and remove all players.";
        } else {
            document.getElementById("leave-confirm-title").textContent = "Leave lobby?";
            msg.textContent = "Are you sure you want to leave this lobby?";
        }

        overlay.classList.add("visible");
    }

    renderLobby(lobby, auth) {
        const grid = document.getElementById("player-grid");
        grid.innerHTML = "";

        // Fill player slots left to right
        for (let i = 0; i < lobby.max_players; i++) {
            const player = lobby.players[i] || null;
            const slotNumber = i + 1;
            const isOwnSlot = player && player.player_id === auth.player_id;
            const isHostSlot = player && player.player_id === lobby.host_id;

            const slot = document.createElement("div");
            slot.className = [
                "player-slot",
                player ? "" : "empty",
                player?.ready ? "ready" : "",
                isOwnSlot ? "own-slot" : ""
            ].filter(Boolean).join(" ");

            if (player) {
                // Get helmet color from player_data for avatar circle background
                const helmetColor = player.player_data?.helmetColors?.helmet || "#1f6784";
                const initials = player.display_name.slice(0, 2).toUpperCase();

                slot.innerHTML = `
                    <span class="slot-number">${slotNumber}</span>
                    ${isHostSlot ? '<span class="slot-host-badge">Host</span>' : ''}
                    <div class="slot-avatar" style="background: ${helmetColor};">${initials}</div>
                    <span class="slot-display-name">${this.escapeHtml(player.display_name)}</span>
                    <span class="slot-ready-indicator">${player.ready ? "✓ Ready" : ""}</span>
                `;

                // Hint for own slot
                if (isOwnSlot) {
                    slot.title = player.ready ? "Click to unready" : "Click to ready up";
                }
            } else {
                slot.innerHTML = `
                    <span class="slot-number">${slotNumber}</span>
                    <div class="slot-avatar empty-avatar"></div>
                    <span class="slot-display-name empty-name">Waiting...</span>
                    <span class="slot-ready-indicator"></span>
                `;
            }

            grid.appendChild(slot);
        }

        // Update hint text for host
        const hint = document.getElementById("lobby-room-hint");
        if (this.isHost) {
            const allReady = lobby.players.every(p => p.ready);
            hint.textContent = allReady
                ? "All players ready!"
                : "You can start whenever you want";
        } else {
            const ownPlayer = lobby.players.find(p => p.player_id === auth.player_id);
            hint.textContent = ownPlayer?.ready
                ? "Waiting for host to start..."
                : "Click your slot to ready up";
        }
    }

    escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    reset() {
        // Unregister handlers when leaving the view
        if (this.lobbyClient) {
            this.lobbyClient.off("LOBBY_STATE");
            this.lobbyClient.off("LOBBY_CLOSED");
            this.lobbyClient.off("GAME_STARTING");
        }
    }
}
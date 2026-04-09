import {authenticateGuest, getStoredAuth} from "../multiplayer/multiplayerAuth.js";
import { LobbyClient } from "../multiplayer/lobbyClient.js";

export class lobbyBrowserView {
    content;
    ready = false;
    lobbyClient = null;

    constructor(setWhenDone) {
        fetch("../html/lobbyBrowser.html")
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

        // Check if already authenticated this session
        const auth = getStoredAuth()
        if (auth) {
            this.showLobbyBrowser(auth)
        } else {
            this.showDisplayNamePrompt()
        }
    }

    showDisplayNamePrompt() {
        document.getElementById('display-name-screen').style.display = 'flex';
        document.getElementById('lobby-browser-content').style.display = 'none';

        this.initDisplayNameScreen();
    }

    showLobbyBrowser(auth) {
        document.getElementById('display-name-screen').style.display = 'none';
        document.getElementById('lobby-browser-content').style.display = 'block';

        document.getElementById('current-player-name').textContent = auth.display_name;

        this.initLobbyBrowser(auth);
    }

    initDisplayNameScreen() {
        const input = document.getElementById('display-name-input');
        const charCount = document.getElementById('char-count');
        const error = document.getElementById('dn-error');

        input.addEventListener('input', () => {
            charCount.textContent = input.value.length;
        });

        document.getElementById('dn-confirm-btn').addEventListener('click', async () => {
            const name = input.value.trim();
            error.textContent = '';

            if (!name) {
                error.textContent = 'Please enter a display name';
                return;
            }
            if (name.length > 32) {
                error.textContent = 'Display name cannot exceed 32 characters';
                return;
            }

            try {
                const auth = await authenticateGuest(name);
                this.showLobbyBrowser(auth);
            } catch (err) {
                error.textContent = 'Could not connect to lobby service. Check your connection.';
                console.error(err);
            }
        });
    }

    initLobbyBrowser(auth) {
        this.lobbyClient = new LobbyClient();
        window.__lobbyClient = this.lobbyClient

        this.allLobbies = [];
        this.activeFilter = 'all';

        this.lobbyClient.on('LOBBY_LIST', (payload) => {
            this.allLobbies = payload.lobbies || [];
            this.applyFilter();
        })
        this.lobbyClient.on('LOBBY_CREATED', (payload) => this.onLobbyCreated(payload));
        this.lobbyClient.on('LOBBY_STATE', (payload) => this.onLobbyJoined(payload));
        this.lobbyClient.on('ERROR', (payload) => this.onError(payload));

        this.lobbyClient.connect(auth.token, auth.player_id, auth.display_name, this.getPlayerData())
            .then(() => this.lobbyClient.getLobbies())
            .catch(err => {
                console.error('Failed to connect to lobby service:', err);
            });

        document.getElementById('filter-all').addEventListener('click', () => {
            this.setFilter('all');
        });
        document.getElementById('filter-open').addEventListener('click', () => {
            this.setFilter('open');
        });
        document.getElementById('filter-password').addEventListener('click', () => {
            this.setFilter('password');
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.lobbyClient.getLobbies();
        });

        document.getElementById('open-create-btn').addEventListener('click', () => {
            document.getElementById('create-lobby-overlay').style.display = 'flex';
        });

        document.getElementById('create-cancel-btn').addEventListener('click', () => {
            document.getElementById('create-lobby-overlay').style.display = 'none';
        });

        document.getElementById('create-confirm-btn').addEventListener('click', () => {
            this.handleCreateLobby();
        });

        document.getElementById('pw-cancel-btn').addEventListener('click', () => {
            document.getElementById('password-overlay').style.display = 'none';
        });

        document.getElementById('pw-confirm-btn').addEventListener('click', () => {
            this.handlePasswordConfirm();
        });

        document.getElementById('browser-back-btn')?.addEventListener('click', () => {
            this.lobbyClient?.disconnect();
            window.__lobbyClient = null;
            window.viewManager.setView(window.viewManager.views.mainMenu);
        });
    }

    handleCreateLobby() {
        const name = document.getElementById('cl-name').value.trim();
        const maxPlayers = parseInt(document.getElementById('cl-max-players').value);
        const duration = parseInt(document.getElementById('cl-duration').value);
        const password = document.getElementById('cl-password').value;
        const error = document.getElementById('cl-error');

        error.textContent = '';

        if (!name) {
            error.textContent = 'Please enter a lobby name';
            return;
        }

        this.lobbyClient.createLobby(name, maxPlayers, duration, password || undefined);
    }

    handlePasswordConfirm() {
        const password = document.getElementById('pw-input').value;
        const error = document.getElementById('pw-error');

        if (!password) {
            error.textContent = 'Please enter the password';
            return;
        }

        const lobbyId = document.getElementById('password-overlay').dataset.lobbyId;
        this.lobbyClient.joinLobby(lobbyId, password);
        document.getElementById('password-overlay').style.display = 'none';
    }

    setFilter(filter) {
        this.activeFilter = filter;

        // Update active button
        document.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter-${filter}`).classList.add('active');

        this.applyFilter();
    }

    applyFilter() {
        let filtered = this.allLobbies;

        if (this.activeFilter === 'open') {
            filtered = this.allLobbies.filter(filter => !filter.password_protected);
        } else if (this.activeFilter === 'password') {
            filtered = this.allLobbies.filter(filter => filter.password_protected);
        }

        this.renderLobbyList(filtered);
    }

    renderLobbyList(lobbies) {
        const list = document.getElementById('lobby-list');
        list.innerHTML = '';

        if (lobbies.length === 0) {
            list.innerHTML = '<div class="lobby-empty">No lobbies available. Create one!</div>';
            return;
        }

        lobbies.forEach(lobby => {
            const row = document.createElement('div');
            row.className = 'lobby-row';
            row.innerHTML = `
                <div class="lobby-info">
                    <div class="lobby-name">
                        ${this.escapeHtml(lobby.name)}
                        ${lobby.password_protected ? '<span class="lobby-lock">🔒</span>' : ''}
                    </div>
                    <div class="lobby-meta">
                        ${lobby.player_count} / ${lobby.max_players} players · ${lobby.duration_minutes} min
                    </div>
                </div>
                <button class="hud-btn lobby-connect-btn">Connect</button>
            `;
            row.querySelector('.lobby-connect-btn').addEventListener('click', () => {
                if (lobby.password_protected) {
                    const overlay = document.getElementById('password-overlay');
                    overlay.dataset.lobbyId = lobby.lobby_id;
                    document.getElementById('pw-lobby-name').textContent = `"${lobby.name}" is password protected`;
                    document.getElementById('pw-input').value = '';
                    document.getElementById('pw-error').textContent = '';
                    overlay.style.display = 'flex';
                } else {
                    this.lobbyClient.joinLobby(lobby.lobby_id);
                }
            });
            list.appendChild(row);
        });
    }

    onLobbyCreated(payload) {
        document.getElementById('create-lobby-overlay').style.display = 'none';
        sessionStorage.setItem('currentLobby', JSON.stringify(payload));
        window.viewManager.setView(window.viewManager.views.lobbyRoom);
    }

    onLobbyJoined(payload) {
        sessionStorage.setItem('currentLobby', JSON.stringify(payload));
        window.viewManager.setView(window.viewManager.views.lobbyRoom);
    }

    onError(payload) {
        console.warn('Lobby error:', payload);
    }

    getPlayerData() {
        try {
            const data = JSON.parse(localStorage.getItem('playerData'));
            if (data) return data;

            // Return defaults matching AvatarCreator defaults
            return {
                model: 'male',
                colors: { skin: '#c1591a', shirt: '#ff0000', shorts: '#000000', shoes: '#000000' },
                bikeColors: { frame: '#ff5500', tires: '#333333', grip: '#000000', seat: '#222222', pedals: '#555555', pedalCrank: '#888888' },
                helmetColors: { helmet: '#A7E800', padding: '#333333' }
            }
        } catch { return null; }
    }

    escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    reset() {
        // Don't disconnect here. Lobby room reuses this connection
        // Only disconnect if we're going back to main menu
    }
}
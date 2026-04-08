import {authenticateGuest, getStoredAuth} from "../multiplayerAuth.js";

export class lobbyBrowserView {
    content;
    ready = false;

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
        document.getElementById('display-name-prompt').style.display = 'block';
        document.getElementById('lobby-browser-content').style.display = 'none';

        const form = document.getElementById('display-name-form');
        const input = document.getElementById('display-name-input');
        const error = document.getElementById('display-name-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = input.value.trim();

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

    showLobbyBrowser(auth) {
        document.getElementById('display-name-prompt').style.display = 'none';
        document.getElementById('lobby-browser-content').style.display = 'block';

        const nameDisplay = document.getElementById('current-player-name');
        if (nameDisplay) {
            nameDisplay.textContent = auth.display_name;
        }

        // TODO: load lobby list
    }

    reset() {}

    initBackground() {}
}
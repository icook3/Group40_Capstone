// strava.js: Handles Strava OAuth and activity upload
export class Strava {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;

        this.CLIENT_ID = "INPUT CLIENT ID"; // TODO
        this.BACKEND_URL = "https://YOUR-BACKEND.com"; // TODO
        this.STRAVA_BACKEND_HEALTH = "/stravaHealth"
        this.OAUTH_CALLBACK = "/oauth/callback"
        this.REFRESH = "/oauth/refresh"
        this.UPLOAD = "/strava/upload"
    }

    async isStravaBackendUp() {
        try {
            const res = await fetch(`${this.BACKEND_URL}${this.STRAVA_BACKEND_HEALTH}`, {
                method: "GET",
            });

            return res.ok;
        } catch {
            return false;
        }
    }

    // Begin OAuth
    startOAuth() {
        const url = `https://www.strava.com/oauth/authorize` +
            `?client_id=${this.CLIENT_ID}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(this.BACKEND_URL + this.OAUTH_CALLBACK)}` +
            `&scope=activity:write`;

        window.location.href = url;
    }

    // Parse token hash when user returns from backend
    static loadFromRedirect() {
        const hash = new URLSearchParams(window.location.hash.slice(1));

        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const expiresAt = hash.get("expires_at");
        const athleteId = hash.get("athlete_id");

        if (!accessToken) return null;

        // Save to local storage
        localStorage.setItem("strava_access_token", accessToken);
        localStorage.setItem("strava_refresh_token", refreshToken);
        localStorage.setItem("strava_expires_at", expiresAt);
        localStorage.setItem("strava_athlete_id", athleteId);

        // Remove hash for security
        history.replaceState(null, "", window.location.pathname);

        return accessToken;
    }

    // Use stored token
    loadToken() {
        this.accessToken = localStorage.getItem("strava_access_token");
        this.refreshToken = localStorage.getItem("strava_refresh_token");
        this.expiresAt = Number(localStorage.getItem("strava_expires_at"));
    }

    // Check if token is expired
    isTokenExpired() {
        if (!this.expiresAt) return true;

        const now = Math.floor(Date.now() / 1000);
        return now >= this.expiresAt;
    }

    // Strava frontend refresh (can only get new tokens hour before expiration)
    async refreshTokens() {
        this.loadToken();
        if (!this.refreshToken) {
            console.error("No refresh token stored.");
            return null;
        }

        // Call backend
        const res = await fetch (`${this.BACKEND_URL}${this.REFRESH}`, {
           method: "POST",
           headers: {"Content-Type": "application/json"},
           body: JSON.stringify({ refresh_token: this.refreshToken })
        });

        if (!res.ok) {
            return null;
        }

        const data = await res.json();

        // Update local storage
        localStorage.setItem("strava_access_token", data.access_token);
        localStorage.setItem("strava_refresh_token", data.refresh_token);
        localStorage.setItem("strava_expires_at", data.expires_at);

        // Update in-memory
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiresAt = data.expires_at;

        return this.accessToken;
    }

    // Checks if user has been connected to Strava
    static isConnected() {
        return !!localStorage.getItem("strava_access_token") || !!localStorage.getItem("strava_refresh_token");
    }

    // Upload workout to Strava through backend (https://developers.strava.com/docs/reference/#api-Uploads-createUpload)
    async uploadActivity({ tcxBlob, name, description }) {
        this.loadToken();

        // Expired token
        if (this.accessToken && this.isTokenExpired()) {
            const newToken = await this.refreshTokens();
            if (!newToken) {
                const err = new Error("Strava session expired");
                err.status = 401;
                throw err;
            }
            this.loadToken();
        }

        // No access token but has refresh token
        if (!this.accessToken && this.refreshToken) {
            const ok = await this.refreshTokens();
            if (!ok) {
                const err = new Error("Strava token refresh failed");
                err.status = 401;
                throw err;
            }
            this.loadToken();
        }

        // No access token still
        if (!this.accessToken) {
            const err = new Error("Strava not connected");
            err.status = 401;
            throw err;
        }

        const formData = new FormData();
        formData.append("file", tcxBlob, "zlow-ride.tcx");
        formData.append("name", name);
        formData.append("description", description);
        formData.append("trainer", "1");
        formData.append("commute", "0");
        formData.append("data_type", "tcx");
        formData.append("external_id", "zlow-" + Date.now());

        const res = await fetch(`${this.BACKEND_URL}${this.UPLOAD}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${this.accessToken}` },
            body: formData,
        });

        const json = await res.json();
        console.log("UPLOAD RESPONSE:", json);

        if (!res.ok || json.error || json.errors) {
            const err = new Error("Strava upload failed");
            err.status = res.status;
            err.details = json;
            throw err;
        }

        alert("Upload sent! It may take 10–30 seconds to appear in Strava.");
    }
}

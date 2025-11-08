// strava.js: Handles Strava OAuth and activity upload
export class Strava {
    constructor() {
        this.accessToken = null;
        this.STRAVA_ACTIVITIES_URL = "https://www.strava.com/api/v3/activities";
    }

    // Begin OAuth
    startOAuth(clientId, backendCallbackUrl) {
        const url = `https://www.strava.com/oauth/authorize` +
            `?client_id=${clientId}` +
            `&response_type=code` +
            `&redirect_uri=${encodeURIComponent(backendCallbackUrl)}` +
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
        return this.accessToken;
    }

    // Upload workout to Strava
    async uploadActivity({name, description, distance, duration, avgPower, isTrainer}) {
        if (!this.accessToken) throw new Error("Not authenticated");
        const res = await fetch(this.STRAVA_ACTIVITIES_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                description,
                distance: distance * 1000,
                moving_time: duration,
                type: "VirtualRide",
                trainer: 1,
                average_watts: avgPower
              })
        });
        return await res.json();
  }
}

import config from "./config/configLoader.js";

const STORAGE_KEY = "multiplayer_auth";
const LOBBY_HTTP_URL = config.LOBBY_HTTP_URL;

export function getStoredAuth() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return null;
        }
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export async function authenticateGuest(display_name) {
    const res = await fetch(`${LOBBY_HTTP_URL}/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name })
    });

    if (!res.ok) {
        throw new Error('Failed to authenticate with lobby service');
    }

    const data = await res.json()

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        player_id: data.player_id,
        display_name: data.display_name,
        token: data.token
    }))

    return data;
}
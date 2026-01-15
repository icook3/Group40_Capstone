import express from "express";
import axios from "axios";

const router = express.Router();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const FRONTEND_REDIRECT_URI = process.env.FRONTEND_REDIRECT_URI;

// Main OAuth callback endpoint - Strava redirects user here after approval
router.get("/callback", async (req, res) =>{
    try {
        // Strava sends ?code=XYZ in URL
        const {code, error} = req.query;

        // If Strava sends an error than stop
        if (error) {
            return res.status(400).send(`Strava Authorization Error: ${error}`);
        }

        // If Strava doesn't send code
        if (!code) {
            return res.status(400).send("Missing 'code' query parameter");
        }

        // Exchange code for access token securely from server side
        // IMPORTANT: MUST NOT HAPPEN IN BROWSER!!!!!!!
        const tokenURL = "https://www.strava.com/oauth/token";
        const payload = {
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
        };

        // Perform POST to Strava OAuth token endpoint
        const {data} = await axios.post(tokenURL, payload, {
            headers: {"Content-Type": "application/json"},
            timeout: 10000 // Prevents hanging requests
        });

        // Create URL hash to send back to frontend
        // Hashing avoids tokens showing up in browser history or server logs
        const hash = new URLSearchParams({
            access_token: data.access_token ?? "",
            refresh_token: data.refresh_token ?? "",
            expires_at: String(data.expires_at ?? ""),
            athlete_id: String(data.athlete?.id ?? ""),
        }).toString();

        // Redirect user back to frontend with tokens in hash fragment
        const redirectTo = `${FRONTEND_REDIRECT_URI}#${hash}`;

        return res.redirect(302, redirectTo);
    }
    catch (err) {
        // If Strava token exchange fails
        console.error("OAuth exchange failed:", err?.response?.data || err.message);
        return res.status(500).send("OAuth token exchange failed");
    }
});

// Note: Strava only issues a NEW token if the current token expires in <= 1 hour.
// If the existing access token is still valid for > 1 hour,
// Strava will return the SAME access_token and refresh_token.
router.post("/refresh", async (req, res) => {
    try {
        // Front end sends refresh_token in json
        const {refresh_token} = req.body;

        if (!refresh_token) {
            return res.status(400).send("Missing 'refresh_token' in JSON body");
        }

        // Exchange refresh token for new tokens securely from server side
        // IMPORTANT: MUST NOT HAPPEN IN BROWSER!!!!!!!
        const tokenURL = "https://www.strava.com/oauth/token";
        const payload = {
            client_id: STRAVA_CLIENT_ID,
            client_secret: STRAVA_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token
        };

        // Perform POST to Strava OAuth token endpoint
        const {data} = await axios.post(tokenURL, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 10000
        });

        // Return minimal JSON response
        return res.json({
            access_token: data.access_token ?? "",
            refresh_token: data.refresh_token ?? "",
            expires_at: data.expires_at ?? "",
        });

    } catch (err) {
        console.error("Token refresh failed:", err?.response?.data || err.message);
        return res.status(500).send("Token refresh failed");
    }
});

export default router;
import dotenv from "dotenv";
dotenv.config();

const required = [
    "STRAVA_CLIENT_ID",
    "STRAVA_CLIENT_SECRET",
    "FRONTEND_URI",
    "FRONTEND_REDIRECT_URI"
];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
}
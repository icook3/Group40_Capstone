import dotenv from "dotenv";
dotenv.config();

const required = [
    "DATA_DIR",
    "FRONTEND_URI"
];

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required env var: ${key}`);
    }
}
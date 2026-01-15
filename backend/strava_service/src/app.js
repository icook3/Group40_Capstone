import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import oauthRoutes from "./routes/oauthRoutes.js";
import stravaRoutes from "./routes/stravaRoutes.js";

dotenv.config();

const app = express(); // Create express app
app.use(express.json());

// CORS setup
app.use(cors({
    origin: process.env.FRONTEND_URI,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: false
}));

// Health check
app.get("/health", (_req, res) => {
    res.status(200).send("ok");
});


// Routes
app.use("/oauth", oauthRoutes);
app.use("/strava", stravaRoutes);

export default app;
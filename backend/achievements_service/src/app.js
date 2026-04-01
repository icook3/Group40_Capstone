import cors from "cors";
import express from "express";

import achievementRoutes from "./routes/achievements.js";
import userRoutes from "./routes/newUser.js"

const app = express(); // Create express app

// App configuration
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Health check
app.get("/achievementsHealth",
    cors({
        origin: process.env.FRONTEND_URI,
        methods: ["GET"],
    }),
    (_req, res) => {
        res.status(200).send("ok");
    }
);

app.use("/achievements", cors({
    origin: process.env.FRONTEND_URI,
    methods: ["POST", "GET", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));
app.use("/achievements", express.json({
    limit: process.env.MAX_PAYLOAD_SIZE || "200kb"
}));
app.use("/achievements", achievementRoutes);

app.use("/newUser", cors({
    origin: process.env.FRONTEND_URI,
    methods: ["POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));
app.use("/newUser", userRoutes);

export default app;
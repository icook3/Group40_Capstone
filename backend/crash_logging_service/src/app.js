import cors from "cors";
import express from "express";

import intakeRoutes from "./routes/intakeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express(); // Create express app
app.use(express.json({
    limit: process.env.MAX_PAYLOAD_SIZE || "200kb"
}));

// Health check
app.get("/crashLoggingHealth", (_req, res) => {
    res.status(200).send("ok");
});

// CORS only needed for crash intake
app.use("/intake", cors({
    origin: process.env.FRONTEND_URI,
    methods: ["POST"],
}));
app.use("/intake", intakeRoutes);

// No CORS here. This is for admin tooling
app.use("/report", reportRoutes);


export default app;
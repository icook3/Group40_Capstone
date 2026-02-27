import cors from "cors";
import express from "express";

import authenticateReportService from "./services/authenticateReportService.js";
import intakeRoutes from "./routes/intakeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express(); // Create express app

// App configuration
app.disable("x-powered-by");
app.set("trust proxy", 1);

// Health check
app.get("/crashLoggingHealth",
    cors({
        origin: process.env.FRONTEND_URI,
        methods: ["GET"],
    }),
    (_req, res) => {
        res.status(200).send("ok");
    }
);

app.use("/intake", cors({
    origin: process.env.FRONTEND_URI,
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));
app.use("/intake", express.json({
    limit: process.env.MAX_PAYLOAD_SIZE || "200kb"
}));
app.use("/intake", intakeRoutes);


app.use("/report", authenticateReportService, reportRoutes);


export default app;
import express from "express";

import logger from "../util/logger.js";

import {checkRateLimit} from "../services/rateLimitService.js";
import {validateCrashPayload} from "../services/validationService.js";
import {buildCrashReport} from "../models/crashModel.js";
import {storeCrashReport} from "../services/storageService.js";

const router = express.Router();

// Intake crash endpoint
router.post("/", (req, res) => {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);

        // 2. Validate payload
        const validated = validateCrashPayload(req.body);

        // 3. Build the crash file
        const crash = buildCrashReport(validated);

        // 4. Save the crash file
        storeCrashReport(crash);

        // 5. Log it
        logger.info("crash_stored", {
            id: crash.id,
            ip: req.ip
        });

        res.status(200).send("ok");

    } catch (err) {
        logger.warn("crash_rejected", {
            ip: req.ip,
            error: err.message
        });

        if (err.message === "Rate limit exceeded") {
            return res.status(429).send("rate limit exceeded");
        }

        // file write errors
        if (err.message.includes("ENOENT") || err.message.includes("EACCES")) {
            return res.status(500).send("storage failure");
        }

        res.status(400).send("invalid crash report");
    }
});

export default router;
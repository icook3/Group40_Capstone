import express from "express";

import logger from "../util/logger.js";

import {checkRateLimit} from "../services/rateLimitService.js";
import {incrementUserCount, decrementUserCount} from "../services/internalStorageService.js";
import {storeAchievements} from "../services/storageService.js";


const router = express.Router();

router.post("/", (req, res) => {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);
        incrementUserCount();
        storeAchievements();
        res.status(200).send("User Added!");
        logger.info("addUser",{
            id:req.body,
            ip: req.ip
        });
    } catch (err) {
        logger.warn("newUserRejected", {
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

        res.status(400).send("Failed to add new user");
    }
});

router.delete("/", (req, res) => {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);
        decrementUserCount();
        storeAchievements();
        res.status(200).send("User Removed!");
        logger.info("removeUser",{
            id:req.body,
            ip: req.ip
        });
    } catch (err) {
        logger.warn("newUserRejected", {
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

        res.status(400).send("Failed to add new user");
    }
});
export default router;
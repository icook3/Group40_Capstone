import express from "express";

import logger from "../util/logger.js";

import {checkRateLimit} from "../services/rateLimitService.js";
import {achievements, getAchievementPercentage} from "../services/internalStorageService.js";
import {storeAchievements} from "../services/storageService.js";


const router = express.Router();

//achievements endpoint
//if posting, increment the achievement count for the one sent, and store it
router.post("/", (req, res) => {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);
        if (!(typeof req.body === 'string')) {
            throw new Error("Payload must be a string");
        }
        if (achievements.get(req.body)==undefined) {
            achievements.set(req.body,1);
        } else {
            achievements.set(req.body,achievements.get(req.body)+1);
        }
        storeAchievements();
        logger.info("achievementUnlocked",{
            id:req.body,
            ip: req.ip
        });
    } catch (err) {
        logger.warn("achievementReqRejected", {
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

        res.status(400).send("invalid achievement ID");
    }
});

router.get('/',(req, res)=> {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);
        if (!(typeof req.body === 'string')) {
            throw new Error("Payload must be a string");
        }
        res.status(200).send(getAchievementPercentage(req.body));
    } catch (err) {
        logger.warn("achievementReqRejected", {
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

        res.status(400).send("invalid achievement ID");
    }
});
export default router;
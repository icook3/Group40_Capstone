import express from "express";

import logger from "../util/logger.js";

import {checkRateLimit} from "../services/rateLimitService.js";
import {achievements, getAchievementsPercentage} from "../services/internalStorageService.js";
import {storeAchievements} from "../services/storageService.js";


const router = express.Router();

//achievements endpoint
//if posting, increment the achievement count for the ones sent, and store it
router.post("/", (req, res) => {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);
        if ((req.body.find  == undefined)) {
            throw new Error("Payload must be an array");
        } else {
            for (let i=0;i<req.body.length;i++) {
                if (achievements.get(req.body[i])==undefined) {
                    achievements.set(req.body[i],1);
                } else {
                    achievements.set(req.body[i],achievements.get(req.body[i])+1);
                }
            }
        }
        storeAchievements();
        res.status(200).send("Achievements Unlocked!");
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

router.delete("/", (req, res) => {
    try {
        // 1. Check if rate limit has been hit
        checkRateLimit(req.ip);

        if ((req.body.find  == undefined)) {
            throw new Error("Payload must be an array");
        } else {
            for (let i=0;i<req.body.length;i++) {
                if (achievements.get(req.body[i])==undefined) {
                    achievements.set(req.body[i],0);
                } else {
                    achievements.set(req.body[i],achievements.get(req.body[i])-1);
                }
            }
        }
        storeAchievements();
        res.status(200).send("Achievements Locked!");
        logger.info("achievementLocked",{
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
        //get a map with each achievement percentage
        res.status(200).send(getAchievementsPercentage());
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
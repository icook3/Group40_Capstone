import fs from "fs";
import path from "path";
import {achievements} from "./internalStorageService.js";
import logger from "../util/logger.js";

const DATA_DIR = process.env.DATA_DIR;

export function storeAchievements() {
    const achievementDir = path.join(DATA_DIR, "achievements");
    ensureDirectory(achievementDir);

    const fileName = `achievementsStorage.json`;
    const filePath = path.join(achievementDir, fileName);
    fs.writeFileSync(
        filePath,
        JSON.stringify(Object.fromEntries(achievements), null, 2)
    );
}

export function retrieveAchievements() {
    const achievementDir = path.join(DATA_DIR, "achievements");
    ensureDirectory(achievementDir);

    const fileName = `achievementsStorage.json`;
    const filePath = path.join(achievementDir, fileName);
    try {
        achievements = new Map(Object.entries(JSON.parse(fs.readFileSync(filePath,{encoding:"utf-8"}))));    
    } catch (err) {
        logger.warn("achievementsDoNotExist", {
            error: err.message
        });
    }
}

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
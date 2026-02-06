import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const DATA_DIR = process.env.DATA_DIR;
const CRASH_ROOT = path.join(DATA_DIR, "crashes");

// Get reports
router.get("/", (req, res) => {
    try {
        const { limit = 50, date, id } = req.query;

        // Fetch single crash by ID
        if (id) {
            const crash = findCrashById(id);
            return res.json(crash);
        }

        // Fetch crashes by date or all
        const crashes = collectCrashes(date, parseInt(limit, 10));
        res.json(crashes);

    } catch (err) {
        res.status(500).send("failed to read crash reports");
    }
});

function collectCrashes(date, limit) {
    const dates = date ? [date] : fs.readdirSync(CRASH_ROOT);

    const results = [];

    for (const d of dates) {
        const dir = path.join(CRASH_ROOT, d);
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const content = JSON.parse(
                fs.readFileSync(filePath, "utf-8")
            );
            results.push(content);
        }
    }

    // Newest first
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return results.slice(0, limit);
}

function findCrashById(id) {
    const dates = fs.readdirSync(CRASH_ROOT);

    for (const d of dates) {
        const dir = path.join(CRASH_ROOT, d);
        const files = fs.readdirSync(dir);

        for (const file of files) {
            if (file.includes(id)) {
                const filePath = path.join(dir, file);
                return JSON.parse(
                    fs.readFileSync(filePath, "utf-8")
                );
            }
        }
    }

    throw new Error("Crash not found");
}

export default router;
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR;

export function storeCrashReport(crash) {
    const dateFolder = new Date().toISOString().split("T")[0];
    const crashDir = path.join(DATA_DIR, "crashes", dateFolder);

    ensureDirectory(crashDir);

    const fileName = `crash_${crash.id}.json`;
    const filePath = path.join(crashDir, fileName);

    fs.writeFileSync(
        filePath,
        JSON.stringify(crash, null, 2)
    );
}

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
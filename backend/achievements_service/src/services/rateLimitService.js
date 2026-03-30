const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);

const ipMap = new Map();

export function checkRateLimit(ip) {
    const now = Date.now();

    if (!ipMap.has(ip)) {
        ipMap.set(ip, { count: 1, windowStart: now });
        return;
    }

    const entry = ipMap.get(ip);

    // Window expired so reset
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        entry.count = 1;
        entry.windowStart = now;
        return;
    }

    entry.count += 1;

    if (entry.count > RATE_LIMIT_MAX) {
        throw new Error("Rate limit exceeded");
    }
}

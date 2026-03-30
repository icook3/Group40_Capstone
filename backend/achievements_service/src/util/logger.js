function log(level, event, meta = {}) {
    const entry = {
        level,
        event,
        timestamp: new Date().toISOString(),
        ...meta,
    };

    // Single line JSON for Docker logs
    console.log(JSON.stringify(entry));
}

export default {
    info: (event, meta) => log("info", event, meta),
    warn: (event, meta) => log("warn", event, meta),
    error: (event, meta) => log("error", event, meta),
};
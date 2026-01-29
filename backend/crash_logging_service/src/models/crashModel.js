export function buildCrashReport(payload) {
    return {
        id: generateId(),
        timestamp: new Date().toISOString(),
        simulatorVersion: payload.simulatorVersion,
        platform: payload.platform,
        errorMessage: payload.errorMessage,
        stackTrace: payload.stackTrace,
        metadata: payload.metadata || {}
    };
}

function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
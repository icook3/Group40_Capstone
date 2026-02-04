export function buildCrashReport(payload) {
    return {
        id: generateId(),
        timestamp: new Date().toISOString(),

        errorMessage: payload.errorMessage,
        stackTrace: payload.stackTrace,

        // Everything else goes into metadata
        metadata: {
            ...payload
        }
    };
}

function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
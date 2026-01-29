const MAX_STRING_LENGTH = 10000; // Protection from absurd inputs

export function validateCrashPayload(body) {
    requireString(body.simulatorVersion, "simulatorVersion");
    requireString(body.platform, "platform");
    requireString(body.errorMessage, "errorMessage");
    requireString(body.stackTrace, "stackTrace");

    if (body.metadata && typeof body.metadata !== "object") {
        throw new Error("metadata must be an object");
    }

    return body;
}


function requireString(value, fieldName) {
    if (!value || typeof value !== "string") {
        throw new Error(`${fieldName} is required and must be a string`);
    }

    if (value.length > MAX_STRING_LENGTH) {
        throw new Error(`${fieldName} exceeds maximum length`);
    }
}
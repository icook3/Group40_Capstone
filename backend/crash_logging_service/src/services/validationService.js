const MAX_STRING_LENGTH = 10000; // Protection from absurd inputs

export function validateCrashPayload(body) {
    if (!body || typeof body !== "object") {
        throw new Error("Payload must be an object");
    }

    if (!body.errorMessage && !body.stackTrace) {
        throw new Error("Not a crash payload");
    }

    optionalString(body.errorMessage, "errorMessage");
    optionalString(body.stackTrace, "stackTrace");
    optionalString(body.simulatorVersion, "simulatorVersion");
    optionalString(body.platform, "platform");

    if (body.metadata && typeof body.metadata !== "object") {
        throw new Error("metadata must be an object");
    }

    return body;
}


function optionalString(value, name) {
    if (value == null) return;

    if (typeof value !== "string") {
        throw new Error(`${name} must be a string`);
    }

    if (value.length > MAX_STRING_LENGTH) {
        throw new Error(`${name} exceeds maximum length`);
    }
}
import {multiplayerConstants} from "./multiplayerConstants.js";

const {
    serverMSG,
    serverMSGErrors,
    sessionEndReasons,
    clientMSGPayloadLength,
    headerLength
} = multiplayerConstants;

export function decode(view) {
    const messageType = view.getUint8(0);

    switch (messageType) {
        case serverMSG.SESSION_JOIN:
            return decodeSessionJoin(view);
        case serverMSG.WORLD_STATE:
            return decodeWorldState(view)
        case serverMSG.SESSION_END:
            return decodeSessionEnd(view);
        case serverMSG.ERROR:
            return decodeError(view);
        default:
            console.warn(`gameDecoder: unknown message type 0x0${messageType.toString(16)}`);
            return null;
    }
}

export function decodeSessionJoin(view) {
    // player_id: 1B (u8) - assigned slot (1–16)
    const playerId = view.getUint8(headerLength);

    // player_count: 1B (u8) - total riders in session
    const playerCount = view.getUint8(headerLength + 1);

    // duration_seconds: 2B (u16) - ride duration (600–14400)
    const durationSeconds = view.getUint16(headerLength + 2, false);

    return { playerSlot: playerId, playerCount, durationSeconds };
}

export function decodeWorldState(view) {
    // rider_count: 1B (u8)
    const riderCount = view.getUint8(headerLength);

    // RIDER_INPUT repeated × rider_count
    const riders = [];
    let offset = headerLength + 1;

    for (let i = 0; i < riderCount; i++) {
        riders.push({
            // player_id: 1B (u8)
            playerSlot: view.getUint8(offset),
            // power: 2B (u16) - watts
            power: view.getUint16(offset + 1, false),
            // speed: 2B (u16) - km/h × 10
            speed: view.getUint16(offset + 3, false) / 10, // convert back from multiplying by 10
            // x: 4B (s32) - meters × 10, negative = west
            x: view.getInt32(offset + 5, false) / 10,  // convert back from multiplying by 10
            // y: 4B (s32) - meters × 10, negative = south
            y: view.getInt32(offset + 9, false) / 10,  // convert back from multiplying by 10
        });
        offset += clientMSGPayloadLength.RIDER_INPUT;
    }

    return { riderCount, riders };
}

export function decodeSessionEnd(view) {
    const reason = view.getUint8(headerLength);
    return reason;
}

export function decodeError(view) {
    const errorCode = view.getUint8(headerLength)

    // Read null-terminated UTF-8 string
    const bytes = new Uint8Array(view.buffer, headerLength + 1)
    const nullIndex = bytes.indexOf(0)
    const message = new TextDecoder().decode(
        bytes.slice(0, nullIndex === -1 ? bytes.length : nullIndex)
    )

    return { errorCode, message }
}
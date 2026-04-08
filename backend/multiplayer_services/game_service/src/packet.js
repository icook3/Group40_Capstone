// Message types
const MSG = {
    SESSION_JOIN: 0x01,
    RIDER_INPUT: 0x02,
    WORLD_STATE: 0x03,
    SESSION_END: 0x04,
    HEARTBEAT: 0x05,
    ERROR: 0x06
};

// Header is 7 Bytes: msg_type (1) + tick_id (4) + payload_len (2)
const HEADER_SIZE = 7;

// Rider state size in bytes: player_id(1) + power(2) + speed(2) + x(4) + y(4)
const RIDER_SIZE = 13;

let currentTick = 0;

function nextTick() {
    return ++currentTick;
}

function writeHeader(buf, msgType, tickId, payloadLen) {
    buf.writeUInt8(msgType, 0);
    buf.writeUInt32BE(tickId, 1);
    buf.writeUInt16BE(payloadLen, 5);
}

function encodeSessionJoin(player_id, player_count, duration_seconds) {
    // Payload: player_id(1) + player_count(1) + duration_seconds(2) = 4 bytes
    const payloadLen = 4;
    const buf = Buffer.allocUnsafe(HEADER_SIZE + payloadLen);

    writeHeader(buf, MSG.SESSION_JOIN, nextTick(), payloadLen);

    buf.writeUInt8(player_id, 7);
    buf.writeUInt8(player_count, 8);
    buf.writeUInt16BE(duration_seconds, 9);

    return buf;
}

function encodeRiderInput(player_id, power, speed, x, y) {
    const payloadLen = RIDER_SIZE;
    const buf = Buffer.allocUnsafe(HEADER_SIZE + payloadLen);

    writeHeader(buf, MSG.RIDER_INPUT, 0, payloadLen);

    buf.writeUInt8(player_id, 7);
    buf.writeUInt16BE(power, 8);
    buf.writeUInt16BE(speed, 10);
    buf.writeInt32BE(x, 12);
    buf.writeInt32BE(y, 16);

    return buf;
}

function encodeWorldState(riders, tickId) {
    // Payload: rider_count(1) + riders(13 each)
    const payloadLen = 1 + (riders.length * RIDER_SIZE);
    const buf = Buffer.allocUnsafe(HEADER_SIZE + payloadLen);

    writeHeader(buf, MSG.WORLD_STATE, tickId, payloadLen);

    buf.writeUInt8(riders.length, 7);

    let offset = 8;
    for (const rider of riders) {
        buf.writeUInt8(rider.player_id, offset);
        buf.writeUInt16BE(rider.power, offset + 1);
        buf.writeUInt16BE(rider.speed, offset + 3);
        buf.writeInt32BE(rider.x, offset + 5);
        buf.writeInt32BE(rider.y, offset + 9);
        offset += RIDER_SIZE;
    }

    return buf;
}

function encodeSessionEnd(reason) {
    // Payload: reason(1) = 1 byte
    const payloadLen = 1;
    const buf = Buffer.allocUnsafe(HEADER_SIZE + payloadLen);

    writeHeader(buf, MSG.SESSION_END, nextTick(), payloadLen);
    buf.writeUInt8(reason, 7);

    return buf;
}

function encodeError(errorCode, message) {
    // Payload: error_code(1) + message(variable, null terminated)
    const msgBuf = Buffer.from(message + '\0', 'utf8');
    const payloadLen = 1 + msgBuf.length;
    const buf = Buffer.allocUnsafe(HEADER_SIZE + payloadLen);

    writeHeader(buf, MSG.ERROR, nextTick(), payloadLen);
    buf.writeUInt8(errorCode, 7);
    msgBuf.copy(buf, 8);

    return buf;
}

function decodeHeader(buf) {
    if (buf.length < HEADER_SIZE) {
        throw new Error('Packet too small to contain header');
    }

    return {
        msgType: buf.readUInt8(0),
        tickId: buf.readUInt32BE(1),
        payloadLen: buf.readUInt16BE(5)
    };
}

function decodeRiderInput(buf) {
    // Payload starts at offset 7 after the header
    // player_id(1) + power(2) + speed(2) + x(4) + y(4) = 13 bytes
    if (buf.length < HEADER_SIZE + RIDER_SIZE) {
        throw new Error('RIDER_INPUT packet too small');
    }

    return {
        player_id: buf.readUInt8(7),
        power: buf.readUInt16BE(8),
        speed: buf.readUInt16BE(10),
        x: buf.readInt32BE(12),
        y: buf.readInt32BE(16)
    };
}

function decode(buf) {
    const { msgType, tickId } = decodeHeader(buf);

    switch (msgType) {
        case MSG.RIDER_INPUT:
            return { msgType, tickId, data: decodeRiderInput(buf) };
        case MSG.HEARTBEAT:
            return { msgType, tickId, data: null };
        default:
            throw new Error(`Unknown message type: 0x${msgType.toString(16)}`);
    }
}

module.exports = {
    MSG,
    nextTick,
    encode: {
        sessionJoin: encodeSessionJoin,
        worldState: encodeWorldState,
        sessionEnd: encodeSessionEnd,
        error: encodeError,
        riderInput:  encodeRiderInput
    },
    decode
};
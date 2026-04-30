import { multiplayerConstants } from './multiplayerConstants.js'

const {
    clientMSG,
    clientMSGPayloadLength,
    headerLength
} = multiplayerConstants;

/* ------------------------------------------------------- */
/* All Game WS Protocol is in the game_service README.md   */
/* ------------------------------------------------------- */

export class GameClient {
    constructor() {
        this.ws = null;
        this.wsUrl = null;
        this.handlers = new Map();

        this.playerSlot = null; // assigned by server in SESSION_JOIN
    }

    connect(sessionUrl, token) {
        return new Promise((resolve, reject) => {
            this.wsUrl = `${sessionUrl}?token=${token}`;

            this.ws = new WebSocket(this.wsUrl);
            this.ws.binaryType = "arraybuffer";

            this.ws.onopen = () => {
                resolve();
            };

            this.ws.onmessage = (event) => {
                try {
                    // event.data is an ArrayBuffer, convert to DataView to read bytes
                    const view = new DataView(event.data);
                    const msgType = view.getUint8(0);

                    const handler = this.handlers.get(msgType)
                    if (handler) {
                        handler(view)
                    }
                } catch (err) {
                    console.error('GameClient message error:', err)
                }
            };

            this.ws.onerror = () => {
                reject(new Error("Failed to connect to WS game service"))
            }

            this.ws.onclose = () => {
                const handler = this.handlers.get("DISCONNECTED");
                if (handler) {
                    handler();
                }
            }
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    sendHeartbeat() {
        // Only consists of header (7B)
        const buf = new ArrayBuffer(headerLength);
        const view = new DataView(buf);

        this.buildBinaryHeader(clientMSG.HEARTBEAT, clientMSGPayloadLength.HEARTBEAT, view);

        this.ws.send(buf);
    }


    sendRiderInput(power, speed, x, y) {
        // Consists of header (7B) and rider input (13B)
        const buf = new ArrayBuffer(headerLength + clientMSGPayloadLength.RIDER_INPUT);
        const view = new DataView(buf);

        // 0x02 is RIDER_INPUT message type
        this.buildBinaryHeader(clientMSG.RIDER_INPUT, clientMSGPayloadLength.RIDER_INPUT, view);
        this.buildBinaryRiderInput(power, speed, x, y, view);

        this.ws.send(buf);
    }

    // msg_type | tick_id  | payload_len
    // 1B (u8)  | 4B (u32) | 2B (u16)
    buildBinaryHeader(messageType, payloadLength, view) {
        view.setUint8(0, messageType)
        view.setUint32(1, 0, false) // tick_id (0, we don't track ticks client side)
        view.setUint16(5, payloadLength, false)
    }

    buildBinaryRiderInput(power, speed, x, y, view) {
        //player_id: 1B (u8)
        view.setUint8(headerLength, this.playerSlot);

        // power: 2B (u16) - watts
        view.setUint16(headerLength + 1, power, false);

        // speed: 2B (u16) - km/h × 10
        const speedTimes10 = Math.round(speed * 10);
        view.setUint16(headerLength + 3, speedTimes10, false);

        // x: 4B (s32) - meters × 10, negative = west
        const xTimes10 = Math.round(x * 10);
        view.setInt32(headerLength + 5, xTimes10, false);

        // y: 4B (s32) - meters × 10, negative = south
        const yTimes10 = Math.round(y * 10);
        view.setInt32(headerLength + 9, yTimes10, false);
    }

    on(messageType, handler) {
        this.handlers.set(messageType, handler);
    }

    off(messageType) {
        this.handlers.delete(messageType);
    }
}
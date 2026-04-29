
class MultiplayerConstants {


    /* LOBBY SERVICE CONSTANTS */
    lobbyErrors = {
        AUTH_FAILED: 4001,
        AUTH_TIMEOUT: 4002,
        INCORRECT_PASSWORD: 4003,
        LOBBY_NOT_FOUND: 4004,
        LOBBY_FULL: 4005,
        NOT_THE_HOST: 4006,
        ALREADY_IN_LOBBY: 4007,
        INVALID_MAX_PLAYERS: 4008,
        INVALID_DURATION: 4009,
    }

    /* GAME SERVICE CONSTANTS */
    clientMSG = {
        RIDER_INPUT: 0x02,
        HEARTBEAT: 0x05,
    }

    serverMSG = {
        SESSION_JOIN: 0x01,
        WORLD_STATE:  0x03,
        SESSION_END:  0x04,
        ERROR:        0x06
    }

    clientMSGPayloadLength = {
        RIDER_INPUT: 13,
        HEARTBEAT: 0,
    }

    serverMSGErrors = {
        INVALID_TOKEN:    0x01,
        SESSION_NOT_FOUND: 0x02,
        SESSION_FULL:     0x03,
        MALFORMED_PACKET: 0x04
    }

    sessionEndReasons = {
        DURATION_REACHED:  0x01,
        SERVER_TERMINATED: 0x02
    }

    headerLength = 7;
}

export const multiplayerConstants = new MultiplayerConstants();
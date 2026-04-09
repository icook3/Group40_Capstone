# Game Service
This service handles everything during a ride.
Validates player tokens, runs a 5hz tick loop, and broadcasts binary encoded world state to all connected riders.
The session ends when the ride duration expires or all players disconnect.

### Session Handoff
The lobby service calls `POST /sessions` internally when a game starts.

Request:
```json
{
  "session_id": "ses_abc123",
  "player_ids": ["uuid1", "uuid2"],
  "duration_seconds": 3600
}
```

## WebSocket Protocol
Clients connect using the URL and token received in `GAME_STARTING`:
```
ws://game-service:4001/sessions/{session_id}?token={one-time-token}
```
Tokens are single-use and expire in 30 seconds. Invalid or expired tokens close the connection immediately.

All packets use a **7 byte binary header**:
```
msg_type | tick_id  | payload_len
1B (u8)  | 4B (u32) | 2B (u16) 
```
All multi-byte values are big-endian.

### Message Types
| Value  | Name           | Direction | Description                                            |
|--------|----------------|-----------|--------------------------------------------------------|
| `0x01` | `SESSION_JOIN` | S -> C    | Sent on connect. Confirms slot, player count, duration |
| `0x02` | `RIDER_INPUT`  | C -> S    | Sent every tick. Power, speed, x, y position           |
| `0x03` | `WORLD_STATE`  | S -> C    | Broadcast every tick. All rider states                 |
| `0x04` | `SESSION_END`  | S -> C    | Session terminated. Clients should disconnect          |
| `0x05` | `HEARTBEAT`    | C -> S    | Sent if no input in last 5 seconds                     |
| `0x06` | `ERROR`        | S -> C    | Connection rejected. Closes immediately after          |

### Packet Layouts
**`SESSION_JOIN` payload (4 bytes):**
```
player_id: 1B (u8) - assigned slot (1–16)
player_count: 1B (u8) - total riders in session
duration_seconds: 2B (u16) - ride duration (600–14400)
```

**`RIDER_INPUT` payload (13 bytes):**
```
player_id: 1B (u8)
power: 2B (u16) - watts
speed: 2B (u16) - km/h × 10
x: 4B (s32) - meters × 10, negative = west
y: 4B (s32) - meters × 10, negative = south
```

**`WORLD_STATE` payload:**
```
rider_count: 1B (u8)
RIDER_INPUT repeated × rider_count
```
Maximum size at 16 riders: 215 bytes per tick.

**`SESSION_END` payload (1B):**

| Value  | Meaning                      |
|--------|------------------------------|
| `0x01` | Ride duration reached        |
| `0x02` | Session terminated by server |

**`ERROR` payload:**

| Value  | Meaning                  |
|--------|--------------------------|
| `0x01` | Invalid or expired token |
| `0x02` | Session not found        |
| `0x03` | Session already full     |
| `0x04` | Malformed packet         |

#### Tick Rate and Dead Reckoning
The server broadcasts `WORLD_STATE` at **5hz (every 200ms)**. 
Clients are expected to interpolate other riders' positions between ticks using their last known speed and direction.
Clients that send no `RIDER_INPUT` or `HEARTBEAT` for **15 seconds** are dropped from the session.

### Session Lifecycle
```
Client connects with token
        |
        ⌄
   [validating] -- invalid token -- ERROR 0x01 → disconnect
        |
        ⌄
     [joined] -- SESSION_JOIN sent to client
        |
        | tick loop starts on first player connect
        ⌄
     [riding] <-- RIDER_INPUT (C -> S) / WORLD_STATE (S -> C) at 5hz
        |
        | duration expires OR all players disconnect
        ⌄
     [ended] -- SESSION_END broadcast -> all clients disconnect
```

## How to Run Tests
1. Start a redis container in docker on port 4002
```bash
docker run -d -p 4002:6379 --name game-redis redis:7-alpine
```

2. Run tests
```bash
cd backend/multiplayer_services/game_service
npm install
npm test
```

Expected: **16/16 tests passing**

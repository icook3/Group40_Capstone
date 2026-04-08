# Lobby Service
This service handles everything before a ride starts.
Players authenticate as guests, browse, join, or create lobbies, and wait for the host to start.
When the host starts the game, the lobby service coordinates the handoff to the game session service and destroys itself.

## Authentication
Players authenticate as anonymous guests. Clients authenticate at `POST /auth/guest`
The JWT expires after 24 hours and is used for all client to WebSocket connections.

### Request:
```json
{ "display_name": "player name" }
```
### Response:
```json
{
  "player_id": "uuid",
  "display_name": "CyclistDave",
  "token": "signed-jwt"
}
```

## WebSocket Protocol
Connect to `ws://lobby-service:4000/ws` and send an AUTH message within 5 seconds.

All messages follow this envelope:
```json
{ "type": "MESSAGE_TYPE", "payload": {} }
```

## Message Types:

### Authentication

### `AUTH` (Client -> Server)
First message sent after connecting (**must arrive within 5 seconds**).
```json
{
  "type": "AUTH",
  "payload": {
    "player_id": "player id",
    "token": "jwt-token",
    "player_data": {
      "model": "model_id",
      "colors": {
        "skin": "#hex",
        "shirt": "#hex",
        "shorts": "#hex",
        "shoes": "#hex"
      },
      "bikeColors": {
        "frame": "#hex",
        "tires": "#hex",
        "grip": "#hex",
        "seat": "#hex",
        "pedals": "#hex",
        "pedalCrank": "#hex"
      },
      "helmetColors": {
        "helmet": "#hex",
        "padding": "#hex"
      }
    }
  }
}
```
**Constraints:**
- `player_data`: is optional, connection will succeed without it

### `AUTH_ACK` (Server -> Client)
Confirms authentication was successful.
```json
{
  "type": "AUTH_ACK",
  "payload": {
    "player_id": "player id"
  }
}
```

## Lobby Management

### `CREATE_LOBBY` (Client -> Server)
Creates a new lobby. The creator becomes the host.
```json
{
  "type": "CREATE_LOBBY",
  "payload": {
    "name": "lobby name",
    "max_players": 4,
    "duration_minutes": 60,
    "password": "optional"
  }
}
```
**Constraints:**
- `max_players`: `2`, `4`, `8`, `16`
- `duration_minutes`: 10-minute increments, up to 240 minutes (4 hours)
- `password`: optional (sent over TLS, hashed server-side)

### `LOBBY_CREATED` (Server -> Client)
Sent to host after successful lobby creation.
```json
{
  "type": "LOBBY_CREATED",
  "payload": {
    "lobby_id": "lobby id",
    "name": "lobby name",
    "max_players": 4,
    "duration_minutes": 60,
    "password_protected": true,
    "host_id": "host id",
    "players": [
      { "player_id": "player id", "ready": false }
    ]
  }
}
```

### `GET_LOBBIES` (Client -> Server)
Requests a list of public lobbies.
```json
{
  "type": "GET_LOBBIES",
  "payload": {}
}
```

### `LOBBY_LIST` (Server -> Client)
Returns all available public lobbies (not in-game).
```json
{
  "type": "LOBBY_LIST",
  "payload": {
    "lobbies": [
      {
        "lobby_id": "lobby id",
        "name": "lobby name",
        "max_players": 4,
        "duration_minutes": 60,
        "player_count": 2,
        "password_protected": false
      }
    ]
  }
}
```

### `JOIN_LOBBY` (Client -> Server)
Requests to join a lobby.
```json
{
  "type": "JOIN_LOBBY",
  "payload": {
    "lobby_id": "lobby id",
    "password": "optional"
  }
}
```

### `LOBBY_STATE` (Server -> Client)
Broadcast whenever lobby state changes (join/leave/ready toggle).
```json
{
  "type": "LOBBY_STATE",
  "payload": {
    "lobby_id": "lobby id",
    "name": "lobby name",
    "max_players": 4,
    "duration_minutes": 60,
    "password_protected": true,
    "host_id": "host id",
    "players": [
      { "player_id": "player id",
        "ready": false,
        "player_data": {
          "model": "model_id",
          "colors": {
            "skin": "#hex",
            "shirt": "#hex",
            "shorts": "#hex",
            "shoes": "#hex"
          },
          "bikeColors": {
            "frame": "#hex",
            "tires": "#hex",
            "grip": "#hex",
            "seat": "#hex",
            "pedals": "#hex",
            "pedalCrank": "#hex"
          },
          "helmetColors": {
            "helmet": "#hex",
            "padding": "#hex"
          }
        }
      },
      { "player_id": "player id", 
        "ready": true, 
        "player_data": { ... }
      }
    ]
  }
}
```

## Player Actions

### `SET_READY` (Client -> Server)
Toggle player ready state.
```json
{
  "type": "SET_READY",
  "payload": {
    "ready": true
  }
}
```

### `LEAVE_LOBBY` (Client -> Server)
Leave the current lobby.
```json
{
  "type": "LEAVE_LOBBY",
  "payload": {}
}
```

### `LOBBY_CLOSED` (Server -> Client)
Sent when host leaves and lobby is destroyed.
```json
{
  "type": "LOBBY_CLOSED",
  "payload": {
    "reason": "host left"
  }
}
```

## Game Start Flow

### `START_GAME` (Client -> Server)
Triggered by host to start the game.
```json
{
  "type": "START_GAME",
  "payload": {}
}
```

### `GAME_STARTING` (Server -> Client)
Broadcast to all players with session connection details.
```json
{
  "type": "GAME_STARTING",
  "payload": {
    "session_id": "session id",
    "session_url": "session-url/session_id",
    "token": "one-time-token",
    "expires_in": 30,
    "players": [
      {
        "player_id": "player id",
        "display_name": "name",
        "player_data": {
          "model": "model_id",
          "colors": {
            "skin": "#hex",
            "shirt": "#hex",
            "shorts": "#hex",
            "shoes": "#hex"
          },
          "bikeColors": {
            "frame": "#hex",
            "tires": "#hex",
            "grip": "#hex",
            "seat": "#hex",
            "pedals": "#hex",
            "pedalCrank": "#hex"
          },
          "helmetColors": {
            "helmet": "#hex",
            "padding": "#hex"
          }
        }
      }
    ]
  }
}
```

**Important Notes:**
- Token is unique per player and single use
- Token expires in 30 seconds
- Lobby is destroyed immediately after this message
- Clients should:
    1. Disconnect from lobby service
    2. Connect to session service immediately

## Error Handling

### `ERROR` (Server -> Client)
Sent in response to invalid client actions.
```json
{
  "type": "ERROR",
  "payload": {
    "code": 4000,
    "message": "error message"
  }
}
```

#### Error Codes:
| Code | Meaning                   |
|------|---------------------------|
| 4001 | Authentication failed     |
| 4002 | Authentication timed out  |
| 4003 | Incorrect password        |
| 4004 | Lobby not found           |
| 4005 | Lobby full                |
| 4006 | Not the host              |
| 4007 | Already in a lobby        |
| 4008 | Invalid max_players value |
| 4009 | Invalid duration value    |

### Lobby Lifecycle
```
CREATE_LOBBY
     |
     |
     ⌄
 [waiting] <-- players JOIN_LOBBY, SET_READY
     |
     | host sends START_GAME
     ⌄
 [starting] -- GAME_STARTING broadcast to all players
     |
     |
     ⌄
 [destroyed] <-- or host sends LEAVE_LOBBY at any point
```

### Player Customization
Player customization data (`model`, `colors`, `bikeColors`, `helmetColors`) is sent with the `AUTH` message and stored on the connection.
It is included in all `LOBBY_STATE` broadcasts and in the `GAME_STARTING` message so the game session has full customization data 
without additional syncing.

### Session Handoff
The lobby service calls `POST /sessions` internally when a game starts.

## How to Run Tests
1. Start a redis container in docker on port 4001
```bash
docker run -d -p 4001:6379 --name lobby-redis redis:7-alpine
```

2. Run tests
```bash
cd backend/multiplayer_service/lobby_service
npm install
npm test
```

Expected: **31/31 tests passing**
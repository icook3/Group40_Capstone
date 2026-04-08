# Multiplayer Services
This directory contains two backend services that together provide a complete multiplayer session system for the biking simulator. 
The services are built in Node.js, communicate over WebSocket, and deployed via Docker.

## Services Overview
Both services have a README.md for deeper documentation; including protocol breakdowns, lifecycle, and how to run test cases.

### Lobby Service
This service handles everything before a ride starts. 
Players authenticate as guests, browse, join, or create lobbies, configure ride settings, and wait for the host to start. 
When the host starts the game, the lobby service coordinates the handoff to the game session service and destroys itself.

### Game Service
This service handles everything during a ride. 
Validates player tokens, runs a 5hz tick loop, and broadcasts binary encoded world state to all connected riders.
The session ends when the ride duration expires or all players disconnect.

## Architecture
```
Clients
  |
  |-- WebSocket --> Lobby Service (JSON)
  |                      |
  |                      | HTTP POST /sessions (handoff)
  |                      ⌄
  |-- WebSocket --> Game Session Service (Binary)
                         |
                    Both services
                         |
                         ⌄
                       Redis
                  (shared state + tokens)
```
- The lobby service is stateless. All the lobby state live in Redis.
- The game service has the active session live in memory.
- Services communicate with each other over internal HTTP.
- Both share the same Redis instance for session token handoff.

## Structure
- `multiplayer_services`
  - `lobby_service`
    - `src`
      - `server.js` - Entry point, HTTP and WebSocket server
      - `auth.js` - Guest JWT auth, POST /auth/guest
      - `handlers.js` - WebSocket message routing and handlers
      - `lobby.js` - Lobby CRUD and Redis
      - `redis.js` - Redis client setup
    - `tests`
      - `lobby.test.js` - Integration test suite (31 tests)
      - `redis.test.js` - Redis connection test (1 test)
    - `.dockerignore`
    - `Dockerfile`
    - `jest.config.js`
    - `package.json`
    - `package-lock.json`
  - `game_service`
    - `src`
      - `server.js` - Entry point, HTTP + WebSocket server
      - `session.js` - Session management, token validation, and player state
      - `tick.js` - 5Hz tick loop, world state broadcast
      - `packet.js` - Binary encode/decode for all packet types
      - `redis.js` - Redis client setup
    - `tests`
        - `session.test.js` - Integration test suite (16 tests)
        - `redis.test.js` - Redis connection test (1 test)
    - `.dockerignore`
    - `Dockerfile`
    - `jest.config.js`
    - `package.json`
    - `package-lock.json`

## How to Run
### 1. Clone the Repository
```bash
git clone https://github.com/icook3/Group40_Capstone.git
cd Group40_Capstone
```

### 2. Create your `.env` File
Copy the example:
```bash
cp .env.example .env
```

Open .env and fill in your values:
```
# JWT secret for signing guest tokens
# Generate with: 
# Mac/Linux openssl rand -hex 32 | 
# Windows PowerShell: -join ((1..32) | ForEach-Object { "{0:x2}" -f (Get-Random -Maximum 256) })
JWT_SECRET=change-this-to-a-strong-random-secret

# Redis connection
REDIS_HOST=redis
REDIS_PORT=6379

# Service ports
LOBBY_PORT=4000
GAME_PORT=4001

# Internal service URLs
GAME_SERVICE_URL=http://game-service:4001
GAME_SERVICE_WS_URL=ws://game-service:4001

# External Frontend URL
FRONTEND_URL=https://frontend.com
```

### 3. Build Services
```bash
docker compose build
```

### 4. Run Services
```bash
docker compose up
```

### 5. Verify the Services
#### Lobby Service Guest Auth (Powershell)
```bash
Invoke-WebRequest -Uri "http://localhost:4000/auth/guest" -Method POST -ContentType "application/json" -Body '{"display_name": "TestRider"}'
```
Expected response:
```json
{
  "player_id": "uuid-here",
  "display_name": "TestRider",
  "token": "signed-jwt"
}
```
#### Game Service Session Creation (Powershell)
```bash
Invoke-WebRequest -Uri "http://localhost:4001/sessions" -Method POST -ContentType "application/json" -Body '{"session_id": "ses_test", "player_ids": ["p1"], "duration_seconds": 600}'
```
Expected response:
```json
{ "ok": true }
```

## Security Notes
- JWT secret must be kept secret
- Session tokens are single-use and expire in 30 seconds
- Lobby passwords are hashed with bcrypt before storage in Redis and never returned to clients
- No player data is persisted after a session ends
- The `POST /sessions` endpoint on the game service is internal only and is not publicly exposed in production

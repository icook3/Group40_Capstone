## Achievements Service
This service provides a minimal service to track the percentage of users who have certain achievements. It collects a count of users, and a number for each obtained achievement. 

## Structure
- `src` — Stores the source code for this service
    - `config` — Configures the environment variables
        - `env.js` — Loads and validates environment variables using dotenv
    - `routes` — Defines different endpoints
        - `achievements.js` — Endpoints for unlocking achievements, clearing achievements, and getting the percentage of unlocked achievements.
        - `newUser.js` — Endpoints for declaring a new user.
    - `services` — Defines useful services related to achievements
        - `internalStorageService.js` — Stores the map of achievements and unlocked user counts, and the number of users. Also provides methods to convert the internal storage to and from JSON for persistent storage. 
        - `rateLimitService.js` — In memory abuse protection
        - `storageService.js` — Reads and writes achievement data to the filesystem. 
    - `util` — Provides various utilities
        - `logger.js` — Centralized structured logging for service events and errors
    - `app.js` — 
    - `server.js` — 
- `.dockerignore` — Excludes secrets and build artifacts
- `.env.example` — Template for required environment variables
- `Dockerfile` — Container definition
- `package-lock.json` — Locked dependency versions
- `package.json` — Node dependencies and start script
- `README.md` — Achievements service documentation

## How to Run This Service
This service tracks the number of users who have each achievement, and stores it as a JSON file on disk. It is designed to run in Docker and be deployment agnostic, and requires a mounted volume for persistence.

### 1. Clone the Repository
```bash
git clone https://github.com/icook3/Group40_Capstone.git
cd Group40_Capstone/backend/achievements_service
```

### 2. Create your `.env` File
Copy the example:
```bash
cp .env.example .env
```

Open .env and fill in your values:
```
# Root directory where acievement statistics are stored
# This should map to a Docker volume (e.g. /data)
DATA_DIR=/data

# Maximum achievement submissions allowed per IP per window
RATE_LIMIT_MAX=3
# Time window for rate limiting in milliseconds
RATE_LIMIT_WINDOW_MS=60000

# Maximum allowed achievements payload size (e.g. 200KB)
MAX_PAYLOAD_SIZE=200kb

# Allowed site for CORS (frontend origin only, no path)
FRONTEND_URI=https://your-frontend.example.com

# Port service listens on
PORT=4000
```

### 3. Build the Docker Image
```bash
docker build -t achievements-service .
```

### 4. Run the Service in Docker
```bash
docker run --rm -p 3000:3000 -v achievements-data:/data --env-file .env achievements-service
```
You can verify if it is running at `http://localhost:4000/achievementsHealth` or `http://your-backend-example.com/achievementsHealth`
You should get back `ok`

### 5. Test unlocking achievements
```bash
Invoke-RestMethod -Uri "http://localhost:4000/achievements" `
  -Method POST `
  -ContentType "application/json" `
  -Body '["Unlocked1", "Unlocked2"]'
```

### 6. Test getting achievements
You can go to `http://localhost:4000/achievements`, and you should get a map with every unlocked achievement currently. 
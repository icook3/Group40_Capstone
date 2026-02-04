## Crash Logging Service
This service provides a minimal, stateless backend for collecting, storing, and inspecting client crash reports.

This service is **NOT** an analytics platform, telemetry pipeline, or metics collector. Its **sole responsibility** 
is to be a reliable crash report intake and storage service.

### Its Responsibilities Include:
- Accepting crash reports over HTTPS
- Validating and sanitizing crash payloads
- Storing crash data on filesystem (no database)
- Providing a simple API to view and query crash reports
- Rate limiting abusive clients

### Crash Report Model
- Simulator version
- Platform / OS information
- Stack trace
- Error message
- Optional metadata
- Timestamp (server-generated)
Clients **must not** send secrets, tokens,or personal data.

## Structure
- `src`
    - `config`
        - `env.js` - Loads and validates environment variables using dotenv
    - `models`
        - `crashModel.js` - Defines crash report schema
    - `routes`
        - `intakeRoutes` - Crash submission endpoints
        - `reportRoutes` - Crash query / viewing endpoints
    - `services`
        - `storageService.js` - Writes crash reports to the filesystem
        - `validationService.js` - Sanitizes and validates payloads
        - `rateLimitService.js` - In memory abuse protection
    - `util`
        - `logger.js` - Centralized structured logging for service events and errors
    - `app.js` - Configures Express application
    - `server.js` - Application entry point
- `/data` - Docker volume mount where crash reports are stored
- `.dockerignore` - Excludes secrets and build artifacts
- `.env.example` - Template for required environment variables
- `Dockerfile` - Container definition
- `package.json` - Node dependencies and start script
- `package-lock.json` - Locked dependency versions
- `README.md` - Crash logging service documentation

## How to Run This Service
This service collects crash reports and stores them as JSON files on disk. It is designed to run in Docker and be deployment agnostic,
and requires a mounted volume for persistence.

### 1. Clone the Repository
```bash
git clone https://github.com/icook3/Group40_Capstone.git
cd Group40_Capstone/backend/crash_logging_service
```

### 2. Create your `.env` File
Copy the example:
```bash
cp .env.example .env
```

Open .env and fill in your values:
```
# Root directory where crash reports are stored
# This should map to a Docker volume (e.g. /data)
DATA_DIR=/data

# Maximum crash submissions allowed per IP per window
RATE_LIMIT_MAX=3
# Time window for rate limiting in milliseconds
RATE_LIMIT_WINDOW_MS=60000

# Maximum allowed crash payload size (e.g. 200KB)
MAX_PAYLOAD_SIZE=200kb

# Allowed site for CORS (frontend origin only, no path)
FRONTEND_URI=https://your-frontend.example.com

# Port service listens on
PORT=3000
```

### 3. Build the Docker Image
```bash
docker build -t crash-logging-service .
```

### 4. Run the Service in Docker
```bash
docker run --rm -p 3000:3000 -v crash-data:/data --env-file .env crash-logging-service
```
You can verify if it is running at `http://localhost:3000/crashLoggingHealth` or `http://your-backend-example.com/crashLoggingHealth`
You should get back `ok`

### 5. Test a Crash Submission
```bash
Invoke-RestMethod -Uri "http://localhost:3000/intake" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "simulatorVersion": "1.0.0",
    "platform": "Windows 11 Chrome",
    "errorMessage": "Test crash",
    "stackTrace": "at test()",
    "metadata": {"map":"Basic"}
  }'
```

### 6. View Stored Crash Reports
Fetch recent crashes:
```
http://localhost:3000/report?limit=20
```

Fetch crashes for a specific date:
```
http://localhost:3000/report?date=2026-01-28
```

Fetch a specific crash by ID:
```
http://localhost:3000/report?id=<crash_id>
```

### Deployment Notes
This service is deployment-agnostic and works anywhere Docker runs.
The only requirement is that the path defined by DATA_DIR is backed by persistent storage.

### Security Notes
- This service accepts crash reports without authentication by design
- Protection is provided through strict validation, payload limits, and rate limiting
- Crash reports must never contain secrets, tokens, or personal data

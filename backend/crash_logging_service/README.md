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
    - `routes`
        - `intakeRoutes` - Crash submission endpoints
        - `reportRoutes` - Crash query / viewing endpoints
    - `services`
        - `storageService.js` - Writes crash reports to the filesystem
        - `validationService.js` - Sanitizes and validates payloads
        - `rateLimitService.js` - In memory abuse protection
    - `models`
        - `crashModel.js` - Defines crash report schema
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
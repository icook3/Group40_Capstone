## Strava Service
This service provides a minimal, stateless backend that securely integrates a client-side application with the Strava API.
This service assumes a single backend instance. Horizontal scaling would require a shared rate-limit state.

Its OAuth responsibilities include:
- Performing a **secure** OAuth authorization code → token exchange.
- Protecting the **Strava Client Secret**
- Receiving the authorization `code` and exchanging it for `access_token` and `refresh_token` values
- Redirecting the user back to the frontend with tokens in the URL `#hash`

Its upload responsibilities include:
- Handling activity file uploads (TCX) on behalf of the frontend
- Enforcing Strava API rate limits using in-memory counters

## Structure
- `src` - Service source code
    - `config` - Runtime configuration logic
      - `env.js` - Loads and validates environment variables using dotenv
    - `routes` - HTTP API endpoints
      - `oauthRoutes` - Handles all Strava OAuth related functionalities
      - `stravaRoutes` - Handles post authentication Strava operations
    - `util` - Shared utilities and in-memory logic
      - `rateLimits` - Implements Strava's API rate limits using in-memory counters
    - `app.js` - Configures Express application
    - `server.js` - Application entry point
- `.dockerignore` - Excludes secrets and build artifacts
- `.env.example` - Template for required environment variables
- `Dockerfile` - Container definition
- `package.json` - Node dependencies and start script
- `package-lock.json` - Locked dependency versions
- `README.md` - Strava service documentation

## How to Run This Service
Video: https://www.youtube.com/watch?v=4mcSj8wlH-s

This backend performs the secure Strava OAuth **code → token** exchange and uploading activities to Strava.
Follow the steps below to run it. You need a Strava App created beforehand.

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
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret

# Public origin of frontend
FRONTEND_URI=https://your-frontend-example.com

# Full redirect URL where frontend handles Strava response
FRONTEND_REDIRECT_URI=https://your-frontend-example.com/path

PORT=8080
```

### 3. Build the Docker Image
```bash
docker build -t strava-oauth-service .
```

### 4. Run the Service in Docker
```bash
docker run --rm -p 8080:8080 --env-file .env strava-service
```
You can verify if it is running at `http://localhost:8080/health` or `http://your-backend-example.com/health`
You should get back `ok`

### 5. Deploy or Expose Publicly to Test with Strava

Strava must be able to reach this service at a **public HTTPS URL**.
For local development or production, this means one of the following:

| Environment               | Requirement |
|---------------------------|-------------|
| Local Deployment          | Expose `http://localhost:8080` through a secure public URL (HTTP tunneling or reverse proxy) |
| Cloud / Server Deployment | Deploy the container to any hosting provider that provides HTTPS |

This service is deployment-agnostic and works anywhere Docker runs.

You will take the **public URL** where this service is hosted and use it as the **OAuth Redirect URL** in your Strava application configuration.

### 6. Configure Strava App
Go to: https://www.strava.com/settings/api

Update the following field:

| Setting | Example Value |
|--------|---------------|
| Authorization Callback Domain | `your-domain-here.com` |

> **Only the domain** goes here — no `https://`, and no `/oauth/callback`.

## OAuth + Token Refresh Flow Summary
1. (Frontend) - Send user to Strava login page
2. (Strava UI) - User approves permissions
3. (Strava) - Redirects back to this service with ?code=XYZ
4. (Backend) - Exchanges code for tokens securely
5. (Backend) - Redirects user to FRONTEND_REDIRECT_URI#access_token=...&refresh_token=...
6. (Frontend) - Stores tokens and clears hash
7. (Frontend) - Uses access token to call Strava API
8. (Frontend) - When access token expires, sends refresh token to this service via JSON
9. (Backend) - Exchanges refresh token with Strava for new tokens
10. (Backend) - Returns updated tokens to frontend as a JSON (not a redirect)
11. (Frontend) - Replaces stored tokens with new ones

## Upload Flow Summary
1. (Frontend) - Generates an activity file (TCX) from workout data
2. (Frontend) - Ensures a valid Strava access_token is available, refreshes if not
3. (Frontend) - Constructs a multipart/form-data request containing:
   - Activity file (TCX)
   - Activity metadata (name, description, trainer, commute, data_type, external_id);
   - Authorization header with the Strava access_token
4. (Frontend) - Sends upload request to POST /strava/upload
5. (Backend) - Validates the request by:
   - Verifying presence of access_token
   - Verifying an activity file is included
   - Checking current Strava API usage against rate limits
6. (Backend) - If rate limits allow, forwards the upload request to the Strava API using supplied access_token
7. (Strava API) - Accepts the upload and returns an upload status payload
8. (Backend) - Records the API call in in-memory counters and returns Strava's response to the frontend
9. (Frontend) - Displays upload status to the user

## Security Notes
- The **Strava Client Secret must never be exposed in browser code**.
- Tokens are returned via `#hash` fragment so they **do not appear in browser history or server logs**.
- `.env` files and tokens should **never** be committed to Git.
- If these guidelines are not followed, the client secret should be assumed compromised.

## Refresh Behavior Note
- Strava **only issues new tokens** when the current access token is expired or expires within **1 hour**.  
- If the token is still valid for longer than that, Strava will return the **same** token values.

## Uploading Notes
- Restarting this service resets the API call counters.
- Rate limits are enforced **before** forwarding requests to Strava.
- Only name and description are required in the Activity metadata being sent from frontend to backend.
- The backend does not store activity data or files after forwarding the request.
- All file handling is performed in-memory and discarded after the request completes.

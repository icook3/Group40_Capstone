## Strava OAuth Service
This service performs a **Secure Strava OAuth code > token exchange**
Its only purpose is to:
- Protect the **Strava Client Secret**
- Receive the `code` Strava sends after login
- Exchange it for `access_token` and `refresh_token`
- Redirect user back to your frontend with tokens in the URL `#hash`

This allows for a serverless-style frontend application to use the Strava API **securely** without exposing client secrets in the browser.

## Structure
- `src` - Stores source code
  - `server.js` - Main Node/Express OAuth callback server
- `.dockerignore` - Excludes secrets and build artifacts
- `.env.example` - Template for required environment variables
- `Dockerfile` - Container definition
- `package.json` - Node dependencies and start script
- `package-lock.json` - Locked dependency versions
- `README.md` - Project documentation

## How to Run This Service Locally
This backend performs the secure Strava OAuth **code → token** exchange.  
Follow the steps below to run it locally and test Strava login without deploying a full frontend.

### 1. Clone the Repository
```bash
git clone https://github.com/icook3/Group40_Capstone_Backend.git
cd Group40_Capstone_Backend
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
FRONTEND_URI=https://your-frontend.example.com
FRONTEND_REDIRECT_URI=https://your-frontend.example.com/path
PORT=8080
```

### 3. Build the Docker Image
```bash
docker build -t strava-oauth-service .
```

### 4. Run the Service in Docker
```bash
docker run --rm -p 8080:8080 --env-file .env strava-oauth-service
```
You can verify if it is running at `http://localhost:8080/health`
You should get back `ok`

### 5. Deploy or Expose Publicly to Test with Strava

Strava must be able to reach this service at a **public HTTPS URL** when it performs the OAuth redirect.
For local development or production, this means one of the following:

| Environment | Requirement |
|------------|-------------|
| Local Development | Expose `http://localhost:8080` through a secure public URL (HTTP tunneling or reverse proxy) |
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

## Security Notes
- The **Strava Client Secret must never be exposed in browser code**.
- Tokens are returned via `#hash` fragment so they **do not appear in browser history or server logs**.
- `.env` files and tokens should **never** be committed to Git.
- If not followed you must assume the secret has been stolen

## Refresh Behavior Note
Strava **only issues new tokens** when the current access token is expired or expires within **1 hour**.  
If the token is still valid for longer than that, Strava will return the **same** token values.
## peer service
This service serves to broker different peers on a server.
It's main purpose is to:
- allow connecting through peer-to-peer multiplayer, without having to know your friends IP address
- use a server we control, as compared to relying on peerserver's own server

This allows peer-to-peer communication, while allowing it to only be tied to Zlow's servers, and not PeerJS's servers

## Structure
- `src` - Stores source code
  - `peerServer.js` - Main NodeJS peerServer
- `.dockerignore` - Excludes secrets and build artifacts
- `.env.example` - Template for required environment variables
- `Dockerfile` - Container definition
- `package.json` - Node dependencies and start script
- `package-lock.json` - Locked dependency versions
- `README.md` - Project documentation

## How to Run This Service Locally
This backend uses peerJS to run a peer server. 
Follow the steps below to run it locally. The server can only be tested using the frontend.

### 1. Clone the repository
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
PATH=/peerServer
PORT=8080
```

### 3. Build the Docker image
```bash
docker build -t peer-server-service .
```
MAKE SURE YOU INCLUDE THE `.` AT THE END!

### 4. Run the Service in Docker
```bash
docker run --rm -p 9000:9000 --env-file .env peer-server-service
```
You can verify if it is running at `http://localhost:9000/path`
You should get back a JSON describing the peer server

### 5. Test the service
In the frontend code, set it to direct to the peerServer at the bottom of constants.js. You will have to set the base URL, the port number, and the path. 

## Security Notes
- The `.env` files are not as important to keep secure as they are for the Strava Service. 
- There is no secret to steal
- Anyone who knows the path to the URL can access a list of peers in the peerServer by adding on /peers. (I will have to check if it stores IP addresses - I don't think it will: TODO)

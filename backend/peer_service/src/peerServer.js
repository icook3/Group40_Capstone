import dotenv from "dotenv";
import { PeerServer } from "peer";

dotenv.config();
const peerServer = PeerServer({port: process.env.PORT||9000, path: process.env.SERVERPATH||"/peerServer", allow_discovery: true, corsOptions: [process.env.FRONT||"localhost:8000"]});
import * as http from "http";
import express from "express";
import bodyParser from "body-parser";
import { ExpressPeerServer } from "peer";
import {
    getRoomOwnerPeerId,
    createRoom,
    closeRoom
} from "./src/routes/RoomRoute";
import session from "express-session";
import KEYS from "./keys";

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());

const peerServer = ExpressPeerServer(server, {
    proxied: true,
    path: "/"
});

app.use((req, res, next) => {
    console.log("HTTP request", req.method, req.url);
    res.header("Access-Control-Allow-Origin", KEYS.CLIENT_HOST_PATH);
    next();
});

app.use("/peerjs", peerServer);

let config = {
    secret: KEYS.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false }
};
if (KEYS.IS_PROD) config.cookie.secure = true;

app.use(session(config));

app.get("/test", (req, res) => res.end("It works!"));

app.get("/rooms/:roomName", getRoomOwnerPeerId);

app.post("/rooms/create", createRoom);

app.delete("/rooms/:roomName", closeRoom);

const PORT = process.env.PORT || 5000;
server.listen(PORT);

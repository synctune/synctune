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

app.use("/peerjs", peerServer);

app.use(
    session({
        secret: KEYS.SESSION_SECRET,
        resave: false,
        // cookie: { httpOnly: true, secure: true },
        saveUninitialized: true
    })
);

app.get("/test", (req, res) => res.end("It works!"));

app.get("/rooms/:roomName", getRoomOwnerPeerId);

app.post("/rooms/create", createRoom);

app.delete("/rooms/:roomName", closeRoom);

const PORT = process.env.PORT || 5000;
server.listen(PORT);

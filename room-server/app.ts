import * as http from "http";
import cors from "cors";
import cookie from "cookie";
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

if (KEYS.IS_PROD) {
    app.use(
        cors({
            origin: KEYS.CLIENT_HOST_PATH,
            credentials: true
        })
    );
    app.set("trust proxy", 1);
}
app.use(
    session({
        secret: KEYS.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { httpOnly: true, secure: KEYS.IS_PROD, sameSite: true }
    })
);

// room server
app.get("/test", (req, res) => res.end("It works!"));

app.get("/rooms/:roomName", getRoomOwnerPeerId);

app.post("/rooms/create", createRoom);

app.delete("/rooms/:roomName", closeRoom);

// peerjs
const peerServer = ExpressPeerServer(server, {
    proxied: true,
    path: "/"
});
app.use("/peerjs", peerServer);

const PORT = process.env.PORT || 5000;
server.listen(PORT);

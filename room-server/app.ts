import * as http from "http";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {
    getRoomOwnerPeerId,
    createRoom,
    closeRoom,
} from "./src/routes/RoomRoute";
import KEYS from "./keys";
const sslRedirect = require("heroku-ssl-redirect");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(sslRedirect())

if (KEYS.IS_PROD) {
    app.use(
        cors({
            origin: KEYS.CLIENT_HOST_PATH,
            credentials: true,
        })
    );
}

// room server

app.get("/rooms/:roomName", getRoomOwnerPeerId);

app.post("/rooms/create", createRoom);

app.delete("/rooms/:roomName", closeRoom);

const PORT = process.env.PORT || 5000;
http.createServer(app).listen(PORT);

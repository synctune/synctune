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

function sslRedirect(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    if (req.headers["x-forwarded-proto"] != "https") {
        res.end("Please use https");
    } else {
        next();
    }
}

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

console.log(`Allowed CORS domains: ${KEYS.CLIENT_HOST_PATHS?.join(", ")}`);

app.use(
    cors({
        origin: KEYS.CLIENT_HOST_PATHS ?? undefined,
        credentials: true,
    })
);

if (KEYS.IS_PROD) {
    app.use(sslRedirect);
}

// room server

app.get("/rooms/:roomName", getRoomOwnerPeerId);

app.post("/rooms/create", createRoom);

app.delete("/rooms/:roomName", closeRoom);

const PORT = process.env.PORT || 5000;
http.createServer(app).listen(PORT);

console.log(`Running room server on port ${PORT}`);

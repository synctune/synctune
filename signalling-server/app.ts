import * as http from "http";
import express, { Request, Response, NextFunction } from "express";
import KEYS from "./keys";
import signalling from "./src/io/signalling";

const PORT = process.env.PORT || 5000;
const app = express();
app.get("/test", (req, res) => res.end("It works!"));
app.use((req, res, next) => {
    console.log("HTTP request", req.method, req.url);
    res.header("Access-Control-Allow-Origin", KEYS.CLIENT_HOST_PATH);
    next();
});
const server = http.createServer(app);
server.listen(PORT);

// Setup signalling server
signalling(server);

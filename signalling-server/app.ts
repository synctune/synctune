import * as http from "http";
import express, { Request, Response, NextFunction } from "express";
import signalling from "./src/io/signalling";

const PORT = process.env.PORT || 5000;
const app = express();
app.get("/test", (req, res) => res.end("It works!"));
const server = http.createServer(app);
server.listen(PORT);

// Setup signalling server
signalling(server);


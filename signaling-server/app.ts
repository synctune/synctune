import * as http from "http";
import express, { Request, Response, NextFunction } from "express";

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
server.listen(PORT);

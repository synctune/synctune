import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import crypto from "crypto";
import KEYS from "../../keys";

const A_DAY = 86400;
const redisClient = createClient(KEYS.REDIS_URL);

// @param roomName
// @500 on error returns the error
// @404 if room doesn't exist
// @200 ownerId: peerid of host
export const getRoomOwnerPeerId = (req: Request, res: Response) => {
    const roomName = req.params.roomName;
    redisClient.hgetall(roomName, (err, roomData) => {
        if (err) {
            console.log("getRoomOwner Redis error:", err);
            return res.status(500).end("Error with Redis");
        }
        if (!roomData)
            return res.status(404).end(`No room with name ${roomName}`);
        return res.json({ ownerId: roomData.ownerPeerId });
    });
};

// @body roomName, selfId
// @409 if room exists already
// @200 on success
export const createRoom = (req: Request, res: Response) => {
    const { roomName, selfId } = req.body;
    const secret = crypto.randomBytes(20).toString("hex");
    redisClient.exists(roomName, (err, exists) => {
        if (err) {
            console.log("createRoom Redis error:", err);
            return res.status(500).end("Error with Redis");
        }
        if (exists)
            return res.status(409).end(`Room ${roomName} already exists`);
        redisClient.hmset(
            roomName,
            "ownerPeerId",
            selfId,
            "ownerSecret",
            secret,
            (err, _) => {
                if (err) {
                    console.log("createRoom Redis error:", err);
                    return res.status(500).end("Error with Redis");
                }
                redisClient.expire(roomName, A_DAY, (err, _) => {
                    if (err) {
                        console.log("createRoom Redis error:", err);
                        return res.status(500).end("Error with Redis");
                    }
                    res.cookie("secret", secret, {
                        httpOnly: true,
                        secure: KEYS.IS_PROD,
                        sameSite: "none",
                    });
                    return res.end("OK");
                });
            }
        );
    });
};

// @param roomName
// @500 on error returns the error
// @404 if room doesn't exist
// @501 if the requester is not the room owner
// @200 on success
export const closeRoom = (req: Request, res: Response) => {
    const { roomName } = req.params;
    // query redis for room name
    redisClient.hgetall(roomName, (err, roomData) => {
        if (err) {
            console.log("closeRoom Redis error:", err);
            return res.status(500).end("Error with Redis");
        }

        if (!roomData) {
            return res.status(404).end(`No room with name ${roomName}`);
        }

        if (
            "secret" in req.cookies &&
            roomData.ownerSecret !== req.cookies.secret
        ) {
            return res
                .status(401)
                .end("You can't delete this room since you don't own it");
        }

        redisClient.del(roomName, (err, numDel) => {
            if (err) {
                console.log("closeRoom Redis error:", err);
                return res.status(500).end("Error with Redis");
            }
            return res.end("OK");
        });
    });
};

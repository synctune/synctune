import { Request, Response, NextFunction } from "express";
import { createClient } from "redis";
import KEYS from "../../keys";

const redisClient = createClient(KEYS.REDIS_URL);

// @param roomName
// @500 on error returns the error
// @404 if room doesn't exist
// @200 ownerId: peerid of host
export const getRoomOwnerPeerId = (req: Request, res: Response) => {
    const roomName = req.params.roomName;
    redisClient.hgetall(roomName, (err, roomData) => {
        if (err) return res.status(500).end(err);
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
    const userId = req.sessionID; //cant ever be null
    console.log(userId)
    redisClient.exists(roomName, (err, exists) => {
        if (err) return res.status(500).end(err);
        if (exists)
            return res.status(409).end(`Room ${roomName} already exists`);
        redisClient.hmset(
            roomName,
            "ownerPeerId",
            selfId,
            "ownerSessionId",
            userId!,
            (err, _) => {
                if (err) return res.status(500).end(err);
                return res.end("OK");
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
        if (err) return res.status(500).end(err);
        if (!roomData)
            return res.status(404).end(`No room with name ${roomName}`);
        if (roomData.ownerSessionId !== req.sessionID)
            return res
                .status(501)
                .end("You can't delete this room since you don't own it");
        redisClient.del(roomName, (err, numDel) => {
            if (err) return res.status(500).end(err);
            return res.end("OK");
        });
    });
};

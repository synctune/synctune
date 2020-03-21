"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var socket_io_1 = __importDefault(require("socket.io"));
var RoomTracker_1 = __importDefault(require("../room/RoomTracker"));
var keys_1 = __importDefault(require("../../keys"));
// TODO: add validation to all socket.on params
exports.default = (function (server) {
    var io = socket_io_1.default(server, { path: keys_1.default.SOCKET_IO_PATH });
    var roomTracker = new RoomTracker_1.default();
    // Handles cleaning up a room when a client leaves, if needed
    function roomLeaveCleanup(socket, room) {
        var id = socket.id;
        // If the owner leaves the room
        if (roomTracker.isOwner(room, id)) {
            io.in(room).clients(function (err, clients) {
                // Kick all other clients from the room
                clients.forEach(function (clientId) {
                    var client = io.sockets.sockets[clientId];
                    // Do nothing if client has already disconnected or it is the owner
                    if (!client || client.id === id)
                        return;
                    // Remove the client from the room
                    client.leave(room);
                    client.emit("room-left", room, true);
                });
                // Unregister the room
                roomTracker.unregisterRoom(room);
            });
        }
        else {
            // Notify other clients
            socket.to(room).emit("client-left", room, socket.id);
        }
    }
    function setupSignallingHandlers(socket, room) {
        // Send WebRTC signal 
        socket.on("signal-send", function (room, targetId, data) {
            io.in(room).clients(function (err, clients) {
                if (err)
                    return socket.emit("error", err);
                if (!clients.includes(socket.id))
                    return socket.emit("not-in-room", room);
                var targetExists = clients.includes(targetId);
                if (!targetExists)
                    return socket.emit("target-not-found", room, targetId);
                console.log(socket.id + ": sending signal to " + targetId); // TODO: remove
                // Send description to the target
                socket.to(targetId).emit("signal-receive", room, socket.id, data);
            });
        });
    }
    io.on("connection", function (socket) {
        console.log("socket '" + socket.id + "' connected"); // TODO: remove
        // Create a room
        socket.on("room-create", function (room) {
            io.in(room).clients(function (err, clients) {
                if (err)
                    return socket.emit("error", err);
                if (clients.length > 0)
                    return socket.emit("room-exists", room);
                setupSignallingHandlers(socket, room);
                // Join room
                socket.join(room);
                // Register the user as the room owner
                roomTracker.registerRoom(room, socket.id);
                // Send to joined socket
                socket.emit("room-created", room);
            });
        });
        // Leave room
        socket.on("room-leave", function (room) {
            io.in(room).clients(function (err, clients) {
                if (err)
                    return socket.emit("error", err);
                if (!clients.includes(socket.id))
                    return socket.emit("not-in-room", room);
                // Leave the room
                socket.leave(room);
                socket.emit("room-left", room, false);
                roomLeaveCleanup(socket, room);
            });
        });
        // Join room
        socket.on("room-join", function (room) {
            io.in(room).clients(function (err, clients) {
                if (err)
                    return socket.emit("error", err);
                if (clients.length === 0)
                    return socket.emit("room-not-exists", room);
                var owner = roomTracker.getOwner(room);
                setupSignallingHandlers(socket, room);
                // Join room
                socket.join(room);
                // Send to joined client
                socket.emit("room-joined", room, owner, clients);
                // Send to all other clients in the room
                socket.to(room).emit("client-joined", room, socket.id);
            });
        });
        // Forceful disconnect
        io.on("disconnecting", function (reason) {
            console.log("socket '" + socket.id + "' disconnecting");
            // Notify all rooms that this client is in that the client has left
            Object.keys(socket.rooms).forEach(function (room) {
                roomLeaveCleanup(socket, room);
            });
        });
    });
});
//# sourceMappingURL=signalling.js.map
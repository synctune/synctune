import { Server } from "http";
import SocketIO, { Socket } from "socket.io";

import RTCDataContainer from "./RTCDataContainer";
import RoomTracker from "../room/RoomTracker";
import SignallingSocket from "./SignallingSocket";
import KEYS from "../../keys";

// TODO: add validation to all socket.on params

export default (server: Server) => {
    const io = SocketIO(server, { path: KEYS.SOCKET_IO_PATH });

    const roomTracker = new RoomTracker();

    // Handles cleaning up a room when a client leaves, if needed
    function roomLeaveCleanup(socket: SignallingSocket, room: string) {
        const id = socket.id;

        // If the owner leaves the room
        if (roomTracker.isOwner(room, id)) {
            io.in(room).clients((err: any, clients: string[]) => {

                // Kick all other clients from the room
                clients.forEach(clientId => {
                    const client: SignallingSocket = io.sockets.sockets[clientId];

                    // Do nothing if client has already disconnected or it is the owner
                    if (!client || client.id === id) return;

                    // Remove the client from the room
                    client.leave(room);
                    client.emit("room-left", room, true);
                });

                // Unregister the room
                roomTracker.unregisterRoom(room);
            });
        } else {
            // Notify other clients
            socket.to(room).emit("client-left", room, socket.id);
        }
    }

    function setupSignallingHandlers(socket: SignallingSocket, room: string) {
        // Send WebRTC signal 
        socket.on("signal-send", (room: string, targetId: string, data: RTCDataContainer) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);
                if (!clients.includes(socket.id)) return socket.emit("not-in-room", room);
    
                const targetExists = clients.includes(targetId);
                if (!targetExists) return socket.emit("target-not-found", room, targetId);

                console.log(`${socket.id}: sending signal to ${targetId}`); // TODO: remove
    
                // Send description to the target
                socket.to(targetId).emit("signal-receive", room, socket.id, data);
            });
        }); 
    }

    io.on("connection", (socket: SignallingSocket) => {
        console.log(`socket '${socket.id}' connected`); // TODO: remove

        // Create a room
        socket.on("room-create", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);
                if (clients.length > 0) return socket.emit("room-exists", room);

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
        socket.on("room-leave", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);
                if (!clients.includes(socket.id)) return socket.emit("not-in-room", room);

                // Leave the room
                socket.leave(room);
                socket.emit("room-left", room, false);

                roomLeaveCleanup(socket, room);
            });
        });

        // Join room
        socket.on("room-join", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);
                if (clients.length === 0) return socket.emit("room-not-exists", room);

                const owner = roomTracker.getOwner(room);
                setupSignallingHandlers(socket, room);

                // Join room
                socket.join(room);
                
                // Send to joined client
                socket.emit("room-joined", room, owner!, clients);

                // Send to all other clients in the room
                socket.to(room).emit("client-joined", room, socket.id);
            });
        });

        // Forceful disconnect
        io.on("disconnecting", (reason: any) => {
            console.log(`socket '${socket.id}' disconnecting`);

            // Notify all rooms that this client is in that the client has left
            Object.keys(socket.rooms).forEach(room => {
                roomLeaveCleanup(socket, room);
            });
        });
    });
};
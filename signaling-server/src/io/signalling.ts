import { Server } from "http";
import SocketIO, { Socket } from "socket.io";

import { EmissionEvents, SignalEvents } from "../constants/SocketEvents";
import RoomTracker from "../room/RoomTracker";

export default (server: Server) => {
    const io = SocketIO(server);

    const roomTracker = new RoomTracker();

    // Handles cleaning up a room when a client leaves, if needed
    function roomLeaveCleanup(socket: SocketIO.Socket, room: string) {
        const id = socket.id;

        // If the owner leaves the room
        if (roomTracker.isOwner(room, id)) {
            io.in(room).clients((err: any, clients: string[]) => {

                // Kick all other clients from the room
                clients.forEach(clientId => {
                    const client = io.sockets.sockets[clientId];

                    // console.log("Sockets", io.sockets.sockets);

                    // Do nothing if client has already disconnected or it is the owner
                    if (!client || client.id === id) return;

                    // Remove the client from the room
                    client.leave(room);
                    client.emit(EmissionEvents.ROOM_LEFT, room, true);
                });

                // Unregister the room
                roomTracker.unregisterRoom(room);
            });
        } else {
            // Notify other clients
            socket.to(room).emit(EmissionEvents.CLIENT_LEFT, room, socket.id);
        }
    }
    

    io.on("connection", (socket: Socket) => {
        // Create a room
        socket.on(SignalEvents.ROOM_CREATE, (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit(EmissionEvents.ERROR, err);
                if (clients.length > 0) return socket.emit(EmissionEvents.ROOM_EXISTS, `Room '${room}' already exists`);

                // Join room
                socket.join(room);

                // Register the user as the room owner
                roomTracker.registerRoom(room, socket.id);

                // Send to joined socket
                socket.emit(EmissionEvents.ROOM_CREATED, `Room '${room}' was created`);
            });
        });

        // Leave room
        socket.on(SignalEvents.ROOM_LEAVE, (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit(EmissionEvents.ERROR, err);
                if (!clients.includes(socket.id)) return socket.emit(EmissionEvents.NOT_IN_ROOM, room);

                // Leave the room
                socket.leave(room);
                socket.emit(EmissionEvents.ROOM_LEFT, room, false);

                roomLeaveCleanup(socket, room);
            });
        });

        // Join room
        socket.on(SignalEvents.ROOM_JOIN, (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit(EmissionEvents.ERROR, err);
                if (clients.length === 0) return socket.emit(EmissionEvents.ROOM_NOT_EXISTS, `Room '${room}' does not exist`);

                // Join room
                socket.join(room);
                
                // Send to joined client
                socket.emit(EmissionEvents.ROOM_JOINED, room, clients);

                // Send to all other clients in the room
                socket.to(room).emit(EmissionEvents.CLIENT_JOINED, room, socket.id);
            });
        });

        // Forceful disconnect
        socket.on("disconnecting", (reason: any) => {
            // Notify all rooms that this client is in that the client has left
            Object.keys(socket.rooms).forEach(room => {
                roomLeaveCleanup(socket, room);
            });
        });
    });
};
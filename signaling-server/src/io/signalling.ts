import { Server } from "http";
import SocketIO, { Socket } from "socket.io";

import { EmissionEvents, SignalEvents } from "../constants/SocketEvents";
import RoomMap from "../room/RoomMap";

export default (server: Server) => {
    const io = SocketIO(server);

    const roomMap = new RoomMap();

    io.on("connection", (socket: Socket) => {
        // Create a room
        socket.on(SignalEvents.ROOM_CREATE, (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit(EmissionEvents.ERROR, err);
                if (clients.length > 0) return socket.emit(EmissionEvents.ROOM_EXISTS, `Room '${room}' already exists`);

                // Join room
                socket.join(room);

                // Register the user as the room owner
                roomMap.registerRoom(room, socket.id);

                // Send to joined socket
                socket.emit(EmissionEvents.ROOM_CREATED, `Room '${room}' was created`);
            });
        });

        // Leave room
        socket.on(SignalEvents.ROOM_LEAVE, (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit(EmissionEvents.ERROR, err);

                const id = socket.id;
                if (!clients.includes(id)) return socket.emit("not-in-room", room);

                // Leave the room
                socket.leave(room);
                socket.emit(EmissionEvents.ROOM_LEFT, room, false);

                // If the owner leaves the room
                if (roomMap.isOwner(room, id)) {
                    // Kick all other clients from the room
                    clients.forEach(clientId => {
                        const client = io.sockets.sockets[clientId];

                        // Do nothing here for owner
                        if (client.id === id) return;

                        // Remove the client from the room
                        client.leave(room);
                        client.emit(EmissionEvents.ROOM_LEFT, room, true);
                    });

                    // Unregister the room
                    roomMap.unregisterRoom(room);
                } else {
                    // Notify other clients
                    socket.to(room).emit(EmissionEvents.CLIENT_LEFT, room, socket.id);
                }
            });
        });

        // Join room
        socket.on("room-join", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit(EmissionEvents.ERROR, err);
                if (clients.length === 0) return socket.emit(EmissionEvents.ROOM_NOT_EXISTS, `Room '${room}' does not exist`);

                // Join room
                socket.join(room);
                
                // Send to joined client
                socket.emit(EmissionEvents.ROOM_JOINED, room);

                // Send to all other clients in the room
                socket.to(room).emit(EmissionEvents.CLIENT_JOINED, room, socket.id);
            });
        });

        socket.on("disconnecting", (reason: any) => {
            // Notify all rooms that this client has left
            Object.keys(socket.rooms).forEach(room => {
                socket.to(room).emit(EmissionEvents.CLIENT_LEFT, room, socket.id);
            });
        });
    });
};
import { Server } from "http";
import SocketIO, { Socket } from "socket.io";

export default (server: Server) => {
    const io = SocketIO(server);

    io.on("connection", (socket: Socket) => {
        // Create a room
        socket.on("room-create", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);
                if (clients.length > 0) return socket.emit("room-exists", `Room '${room}' already exists`);

                // Join room
                socket.join(room);

                // Send to joined socket
                socket.emit("room-created", `Room '${room}' was created`);
            });

            socket.on("disconnect", (reason: any) => {
                const rooms = socket.rooms;

                // Notify all rooms that this client has left
                // TODO: make sure Object.keys is the right choice here
                Object.keys(rooms).forEach(room => {
                    socket.to(room).emit("client-left", socket.id);
                });
            });
        });

        socket.on("room-leave", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);

                const id = socket.id;
                if (!clients.includes(id)) return socket.emit("not-in-room", room);
            
                // Leave the room
                socket.leave(room);

                // Notify other clients
                socket.to(room).emit("client-left", socket.id);

                // TODO: add logic for room ownership
                // and remove all other clients if the room owner left
            });
        });

        // Join room
        socket.on("room-join", (room: string) => {
            io.in(room).clients((err: any, clients: string[]) => {
                if (err) return socket.emit("error", err);
                if (clients.length === 0) return socket.emit("room-not-exists", `Room '${room}' does not exist`);

                // Join room
                socket.join(room);
                
                // Send to joined client
                socket.emit("room-joined", room);

                // Send to all other clients in the room
                socket.to(room).emit("client-joined", socket.id);
            });
        });
    });
};
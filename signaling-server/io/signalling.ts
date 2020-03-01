import { Server } from "http";
import SocketIO, { Socket } from "socket.io";

export default (server: Server) => {
    const io = SocketIO(server);

    io.on("connection", (socket: Socket) => {
        // Create a room
        socket.on("room-create", (room: string) => {
            // TODO: add check to see if already exists

            // socket.join(room);
            socket.emit("room-created", `Room '${room}' was created`);
        });
    });
};
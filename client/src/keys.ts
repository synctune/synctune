export default {
    ROOM_SERVER_SOCKET_IO_PATH: (process.env
        .VUE_APP_ROOM_SERVER_SOCKET_IO_PATH ||
        "room-server/socket.io") as string
};

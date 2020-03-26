export default {
    // TODO: remove
    ROOM_SERVER_SOCKET_IO_PATH: (process.env.VUE_APP_ROOM_SERVER_SOCKET_IO_PATH || "room-server/socket.io") as string,
    
    PEERJS_HOST: (process.env.VUE_APP_PEERJS_HOST) as string | undefined,
    PEERJS_PATH: (process.env.VUE_APP_PEERJS_PATH) as string | undefined,
    PEERJS_PORT: (process.env.VUE_APP_PEERJS_PORT) as number | undefined,
};

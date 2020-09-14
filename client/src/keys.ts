export default {
    ROOM_SERVER_URL: (process.env.VUE_APP_ROOM_SERVER_URL || "/room-server") as string,
    
    PEERJS_HOST: (process.env.VUE_APP_PEERJS_HOST) as string,
    PEERJS_PATH: (process.env.VUE_APP_PEERJS_PATH) as string,
    PEERJS_PORT: parseInt(process.env.VUE_APP_PEERJS_PORT),
    PEERJS_SECURE: (process.env.VUE_APP_PEERJS_SECURE as string) === "true",

    isProduction: (process.env.NODE_ENV === "production")
};

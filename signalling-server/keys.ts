export default {
    SOCKET_IO_PATH: (process.env.SOCKET_IO_PATH || "socket.io") as string,
    REDIS_URL: (process.env.REDIS_URL || "redis://redis") as string,
    SESSION_SECRET: (process.env.SESSION_SECRET || "SUPERSECRET") as string
};

export default {
    REDIS_URL: (process.env.REDIS_URL || "redis://redis") as string,
    SESSION_SECRET: (process.env.SESSION_SECRET || "SUPERSECRET") as string,
    IS_PROD: (process.env.NODE_ENV === "production") as boolean,
    CLIENT_HOST_PATH: (process.env.CLIENT_HOST_PATH || "/") as string
};

function parseClientHostPaths(): string | string[] {
    const hostPathsRaw = process.env.CLIENT_HOST_PATH;
    if (!hostPathsRaw) return "/";

    try {
        const hostPathsParsed = JSON.parse(hostPathsRaw);
        if (typeof hostPathsParsed === "string" || Array.isArray(hostPathsParsed)) {
            return hostPathsParsed;
        } else {
            throw `Invalid CLIENT_HOST_PATH value: ${hostPathsRaw}`;
        }
    } catch(err) {
        return "/";
    }
}

export default {
    REDIS_URL: (process.env.REDIS_URL || "redis://redis") as string,
    SESSION_SECRET: (process.env.SESSION_SECRET || "SUPERSECRET") as string,
    IS_PROD: (process.env.NODE_ENV === "production") as boolean,
    CLIENT_HOST_PATHS: parseClientHostPaths(),
};

export const EmissionEvents = {
    ROOM_CREATE: "room-create",
    ROOM_JOIN: "room-join",
    ROOM_LEAVE: "room-leave",

    // WebRTC Emission Events
    SIGNAL_SEND: "signal-send",
};

export const SignalEvents = { 
    // Self Listener Events
    ROOM_EXISTS: "room-exists",
    ROOM_NOT_EXISTS: "room-not-exists",
    NOT_IN_ROOM: "not-in-room",
    ROOM_CREATED: "room-created",
    ROOM_JOINED: "room-joined",
    ROOM_LEFT: "room-left",
    TARGET_NOT_FOUND: "target-not-found",
    ERROR: "error",

    // Room Listener Events
    CLIENT_JOINED: "client-joined",
    CLIENT_LEFT: "client-left",

    // WebRTC Signalling Events
    SIGNAL_RECEIVE: "signal-receive",
};
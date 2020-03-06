import RTCDataContainer from "./RTCDataContainer";

export default interface SignallingSocket extends SocketIO.Socket {
    // Have to include these default events provided by socket.io
    on(event: "connect", listener: () => void): this;
    on(event: "connect_error", listener: (error: any) => void): this;
    on(event: "connect_timeout", listener: (timeout: any) => void): this;
    on(event: "error", listener: (error: any) => void): this;
    on(event: "disconnect", listener: (reason: string) => void): this;
    on(event: "reconnect", listener: (attemptNumber: number) => void): this;
    on(event: "reconnect_attempt", listener: (attemptNumber: number) => void): this;
    on(event: "reconnecting", listener: (attemptNumber: number) => void): this;
    on(event: "reconnect_error", listener: (error: any) => void): this;
    on(event: "reconnect_failed", listener: () => void): this;
    on(event: "ping", listener: () => void): this;
    on(event: "pong", listener: () => void): this;

    on(event: "room-create", listener: (room: string) => void): this;
    on(event: "room-join", listener: (room: string) => void): this;
    on(event: "room-leave", listener: (room: string) => void): this;
    on(event: "signal-send", listener: (room: string, targetId: string, data: RTCDataContainer) => void): this;

    emit(event: "room-exists", room: string): boolean;
    emit(event: "room-not-exists", room: string): boolean;
    emit(event: "not-in-room", room: string): boolean;
    emit(event: "room-created", room: string): boolean;
    emit(event: "room-joined", room: string, ownerId: string, clients: string[]): boolean;
    emit(event: "room-left", room: string, kicked: boolean): boolean;
    emit(event: "target-not-found", room: string, targetId: string): boolean;
    emit(event: "error", message: any): boolean;
    emit(event: "signal-receive", room: string, senderId: string, data: RTCDataContainer): boolean;
    emit(event: "client-joined", room: string, id: string): boolean;
    emit(event: "client-left", room: string, id: string): boolean;

    to(room: string): this;
}
import RTCDataContainer from '@/rtc/RTCDataContainer';

export default interface SignallingSocket extends SocketIOClient.Socket {
    emit(event: "room-create", room: string): SocketIOClient.Socket;
    emit(event: "room-join", room: string): SocketIOClient.Socket;
    emit(event: "room-leave", room: string): SocketIOClient.Socket;
    emit(event: "signal-send", room: string, targetId: string, data: RTCDataContainer): SocketIOClient.Socket;

    on(event: "room-exists", fn: (room: string) => unknown): SocketIOClient.Emitter;
    on(event: "room-not-exists", fn: (room: string) => unknown): SocketIOClient.Emitter;
    on(event: "not-in-room", fn: (room: string) => unknown): SocketIOClient.Emitter;
    on(event: "room-created", fn: (room: string) => unknown): SocketIOClient.Emitter;
    on(event: "room-joined", fn: (room: string, ownerId: string, clients: string[]) => unknown): SocketIOClient.Emitter;
    on(event: "room-left", fn: (room: string, kicked: boolean) => unknown): SocketIOClient.Emitter;
    on(event: "target-not-found", fn: (room: string, targetId: string) => unknown): SocketIOClient.Emitter;
    on(event: "error", fn: (message: any) => unknown): SocketIOClient.Emitter;
    on(event: "signal-receive", fn: (room: string, senderId: string, data: RTCDataContainer) => unknown): SocketIOClient.Emitter;
    on(event: "client-joined", fn: (room: string, id: string) => unknown): SocketIOClient.Emitter;
    on(event: "client-left", fn: (room: string, id: string) => unknown): SocketIOClient.Emitter;
}
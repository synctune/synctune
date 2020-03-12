import adapter from 'webrtc-adapter';
import Emittable from '@/events/Emittable';
import PeerManager from "@/rtc/PeerManager";
import SignallingSocket from '@/socket/SignallingSocket';
import KEYS from "@/keys";
import io from "socket.io-client";

// TODO: implement this
type RoomManagerStatus = "connected" | "disconnected";

interface RoomManagerEventMap {
    "peermanagercreated": PeerManager;
}

export default class RoomManager extends Emittable {
    private socket: SignallingSocket;
    private _id: string | null;

    private _room: string | null;
    private _roomOwner: string | null;

    private _peerManager: PeerManager | null;

    constructor() {
        super();

        // Create a socket connection
        const socket = io(`/`, { path: KEYS.SIGNALLING_SERVER_SOCKET_IO_PATH });

        this._room = null;
        this._roomOwner = null;
        this._peerManager = null;

        this.socket = socket;
        this._id = null;

        this.setupSignallingSocketListeners(socket);

        socket.on("connect", () => {
            this._id = socket.id;
        });

        window.addEventListener("beforeunload", () => {
            // Leave the room
            this.leaveRoom();
        });
    }


    // -----------------------
    // --- Private Helpers ---
    // -----------------------

    private setupSignallingSocketListeners(socket: SignallingSocket) {
        socket.on("room-left", (room, kicked) => {
            // Disconnect all peers
            this._peerManager?.disconnectAll();
        });
    }

    private createPeerManager(socket: SocketIOClient.Socket, room: string) {
        // Create the peer manager and setup event relays
        this._peerManager = new PeerManager(socket, room);

        this.emitEvent("peermanagercreated", this._peerManager);
    }


    // ----------------------
    // --- Public Methods ---
    // ----------------------

    /**
     * Attempts to crete a room
     * 
     * @param room The room name
     */
    createRoom(room: string) {
        this.socket.on("room-created", (room: string) => {
            this._room = room;
            this._roomOwner = this.socket.id;

            // Setup peer manager
            this.createPeerManager(this.socket, room);
        });

        this.socket.on("client-joined", async(_: any, clientId: string) => {
            // Attempt to establish peer connection 
            this._peerManager?.connectRTC(clientId);
        });

        // Attempt to create room
        this.socket.emit("room-create", room);
    }

    /**
     * Attempts to join a room
     * 
     * @param room The room name
     */
    joinRoom(room: string) {
        this.socket.on("room-joined", (room: string, ownerId: string) => {
            this._room = room;
            this._roomOwner = ownerId;
            
            // Setup peer manager
            this.createPeerManager(this.socket, room);
        });

        // Attempt to join room
        this.socket.emit("room-join", room);
    }

    /**
     * Leaves the current room, if in one
     */
    leaveRoom() {
        if (this._room) {
            this.socket.emit("room-leave", this._room!);
        }
    }


    // ---------------
    // --- Getters ---
    // ---------------

    get id(): string | null {
        return this._id;
    }

    get isOwner(): boolean {
        return this._id === this._roomOwner;
    }

    get peerManager(): PeerManager | null {
        return this._peerManager;
    }

    get signallingSocket(): SignallingSocket {
        return this.socket;
    }

    get room(): string | null {
        return this._room;
    }

    get roomOwner(): string | null {
        return this._roomOwner;
    }


    // -------------------------------------
    // --- EventEmitter Method Overrides ---
    // -------------------------------------

    protected emitEvent<K extends keyof RoomManagerEventMap>(eventName: K, event: RoomManagerEventMap[K]) {
        super.emitEvent(eventName, event);
    }

    addEventListener<K extends keyof RoomManagerEventMap>(eventName: K, listener: (event: RoomManagerEventMap[K]) => any) {
        super.addEventListener(eventName, listener);
    }

    removeEventListener<K extends keyof RoomManagerEventMap>(eventName: K, listener: (event: RoomManagerEventMap[K]) => any) {
        super.addEventListener(eventName, listener);
    }
}

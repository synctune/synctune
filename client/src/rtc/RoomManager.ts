import adapter from 'webrtc-adapter';
import Emittable from '@/events/Emittable';
import PeerManager, { PeerManagerEventMap } from "@/rtc/PeerManager";
import SignallingSocket from '@/socket/SignallingSocket';
import KEYS from "@/keys";
import io from "socket.io-client";
import RTCDataContainer from './RTCDataContainer';

type RoomManagerStatus = "owner" | "client" | "disconnected";

type RoomParam = { room: string }
type ClientIdParam = { clientId: string }
type SenderIdParam = { senderId: string }
type OwnerIdParam = { ownerId: string }
type TargetIdParam = { targetId: string }
type DataParam = { data: RTCDataContainer }
type ClientsParam = { clients: string[] }
type KickedParam = { kicked: boolean }
type MessageParam = { message: any }



interface RoomManagerEventMap extends PeerManagerEventMap {
    "statuschange": RoomManagerStatus;
    "peermanagercreated": PeerManager;

    "roomcreate": RoomParam;
    "roomjoin": RoomParam;
    "roomleave": RoomParam;
    "signalsend": RoomParam & TargetIdParam & DataParam;

    "roomexists": RoomParam;
    "roomnotexists": RoomParam;
    "notinroom": RoomParam;
    "roomjoined": RoomParam & OwnerIdParam & ClientsParam;
    "roomleft": RoomParam & KickedParam;
    "targetnotfound": RoomParam & TargetIdParam;
    "error": MessageParam;

    "signalreceive": RoomParam & SenderIdParam & DataParam;
    "clientjoined": RoomParam & ClientIdParam;
    "clientleft": RoomParam & ClientIdParam;
}

export default class RoomManager extends Emittable {
    private socket: SignallingSocket;
    private id: string | null;

    private _room: string | null;
    private _roomOwner: string | null;

    private _peerManager: PeerManager | null;

    constructor() {
        super();

        const socket = io(`/`, { path: KEYS.SIGNALLING_SERVER_SOCKET_IO_PATH });

        this._room = null;
        this._roomOwner = null;
        this._peerManager = null;

        this.socket = socket;
        this.id = this.socket.id;

        window.addEventListener("beforeunload", () => {
            // Leave the room
            this.leaveRoom();
        });
    }

    createRoom(room: string) {
        this.socket.on("room-created", (room: string) => {
            this._room = room;
            this._roomOwner = this.socket.id;

            // Setup peer manager
            this.setupPeerManager(this.socket, room);
        });

        this.socket.on("client-joined", async(_: any, clientId: string) => {
            // Attempt to establish peer connection 
            this._peerManager?.connectRTC(clientId);
        });

        // Attempt to create room
        this.socket.emit("room-create", room);
    }

    joinRoom(room: string) {
        this.socket.on("room-joined", (room: string, ownerId: string) => {
            this._room = room;
            this._roomOwner = ownerId;
            
            // Setup peer manager
            this.setupPeerManager(this.socket, room);
        });

        // Attempt to join room
        this.socket.emit("room-join", room);
    }

    leaveRoom() {
        if (this._room) {
            this.socket.emit("room-leave", this._room!);

            // Disconnect peer manager
            this._peerManager?.disconnectAll();

            // TODO: Clear all event listeners???
        }
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

    private setupPeerManager(socket: SocketIOClient.Socket, room: string) {
        // Create the peer manager and setup event relays
        this._peerManager = new PeerManager(socket, room);

        this.emitEvent("peermanagercreated", this._peerManager);
    }

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

import adapter from 'webrtc-adapter';
import Emittable from '@/events/Emittable';
import PeerManager, { PeerManagerEventMap } from "@/rtc/PeerManager";
import { SignalEvents, EmissionEvents } from '@/constants/SocketEvents';
import RTCDataContainer from './RTCDataContainer';
import SignallingSocket from '@/socket/SignallingSocket';

type RoomParam = {
    room: string;
}

type ClientsListParam = {
    clients: string[];
}

type ClientIdParam = {
    clientId: string;
}

type KickedParam = {
    kicked: boolean;
}

type ErrorParam = {
    message: any;
}

// type RoomParam = string;
// type ClientsListParam = string[];
// type ClientIdParam = string;
// type KickedParam = boolean;
// type ErrorParam = any;

type RoomManagerStatus = "owner" | "client" | "disconnected";

interface RoomManagerEventMap extends PeerManagerEventMap {
// interface RoomManagerEventMap {
    // "signallingroomcreated": RoomParam;
    // "signallingroomjoined": RoomParam & ClientsListParam;
    // "signallingroomleft": RoomParam & KickedParam;

    // "signallingclientjoined": RoomParam & ClientIdParam;
    // "signallingclientleft": RoomParam & ClientIdParam;

    // "signallingroomexists": RoomParam;
    // "signallingroomnotexists": RoomParam;
    // "signallingerror": ErrorParam;
    // "signallingnotinroom": RoomParam;
    // "signallingtargetnotfound": RoomParam & ClientIdParam;

    // "sigallingsignalreceive": RoomParam & ClientIdParam & { data: RTCDataContainer };

    "statuschange": RoomManagerStatus;
    "peermanagercreated": PeerManager;
    

    // "signallingroomcreated": [RoomParam];
    // "signallingroomjoined": [RoomParam, ClientsListParam];
    // "signallingroomleft": [RoomParam, KickedParam];

    // "signallingclientjoined": [RoomParam, ClientIdParam];
    // "signallingclientleft": [RoomParam, ClientIdParam];

    // "signallingroomexists": [RoomParam];
    // "signallingroomnotexists": [RoomParam];
    // "signallingerror": [ErrorParam];
    // "signallingnotinroom": [RoomParam];
    // "signallingtargetnotfound": [RoomParam, ClientIdParam];

    // "sigallingsignalreceive": [RoomParam, ClientIdParam, RTCDataContainer]

    // "statuschange": [RoomManagerStatus];
}

// export interface IRoomManager {
//     createRoom(room: string): void;
//     joinRoom(room: string): void;
//     leaveRoom(): void;
//     status: RoomManagerStatus;
//     peerManager: IPeerManager;
//     addEventListener<K extends keyof RoomManagerEventMap>(eventName: K, listener: (event: RoomManagerEventMap[K]) => any): void;
//     removeEventListener<K extends keyof RoomManagerEventMap>(eventName: K, listener: (event: RoomManagerEventMap[K]) => any): void;
// }

export default class RoomManager extends Emittable {
    private socket: SignallingSocket;
    private id: string | null;

    private room: string | null;
    // private roomOwner: string | null;

    private _peerManager: PeerManager | null;

    constructor(socket: SocketIOClient.Socket) {
        super();

        this.socket = socket;
        this.id = this.socket.id;

        // this.setupSocketEventRelays(this.socket);
    }

    createRoom(room: string) {
        // Setup socket listeners
        this.setupCommonSocketListeners(this.socket);

        this.socket.on("room-exists", (room: string) => {
            // console.log(`Room '${room}' already exists`); // TODO: remove
            // Do nothing
        });

        this.socket.on("room-created", (room: string) => {
            console.log("~ Room created", room); // TODO: remove

            this.room = room;
            // this.roomOwner = this.socket.id;

            console.log(this.room);

            // Setup peer manager
            this.setupPeerManager(this.socket, room);
        });

        this.socket.on("client-joined", async(_: any, clientId: string) => {
            // console.log(`Client '${clientId}' joined, connecting rtc`, this._peerManager); // TODO: remove

            // Attempt to establish peer connection 
            this._peerManager?.connectRTC(clientId);
        });

        // Attempt to create room
        this.socket.emit("room-create", room);
    }

    joinRoom(room: string) {
        // Setup socket listeners
        this.setupCommonSocketListeners(this.socket);

        this.socket.on("room-not-exists", (room: string) => {
            // console.log(`Room '${room}' does not exist`); // TODO: remove
            // Do nothing
        });

        this.socket.on("room-joined", (room: string, clients: string[]) => {
            // console.log(`Room '${room}' successfully joined`);

            this.room = room;
            
            // Setup peer manager
            this.setupPeerManager(this.socket, room);
        });

        // Attempt to join room
        this.socket.emit("room-join", room);
    }

    leaveRoom() {
        this.socket.emit("room-leave", this.room);

        // Disconnect peer manager
        this._peerManager.disconnectAll();

        // TODO: Clear all event listeners???
    }

    // get status(): RoomManagerStatus {
    //     // No room currently connected to
    //     if (!this.room) return "disconnected";

    //     return (this.id === this.roomOwner) ? "owner" : "client";
    // }

    get peerManager(): PeerManager {
        return this._peerManager;
    }

    get signallingSocket(): SignallingSocket {
        return this.socket;
    }

    private setupPeerManager(socket: SocketIOClient.Socket, room: string) {
        // Create the peer manager and setup event relays
        this._peerManager = new PeerManager(socket, room);
        // this.setupPeerManagerEventRelays(this._peerManager);

        this.emitEvent("peermanagercreated", this._peerManager);
    }

    // private setupSocketEventRelays(socket: SocketIOClient.Socket) {
    //     // TODO: there is probably a better way... with a loop and map or something
    //     // This really needs a better way...
    //     socket.on(SignalEvents.CLIENT_JOINED, this.linkToSocketEvent("signallingclientjoined", ["room", "clientId"]));
    //     socket.on(SignalEvents.CLIENT_LEFT, this.linkToSocketEvent("signallingclientleft", ["room", "clientId"]));
    //     socket.on(SignalEvents.ERROR, this.linkToSocketEvent("signallingerror", ["message"]));
    //     socket.on(SignalEvents.NOT_IN_ROOM, this.linkToSocketEvent("signallingnotinroom", ["room"]));
    //     socket.on(SignalEvents.ROOM_CREATED, this.linkToSocketEvent("signallingroomcreated", ["room"]));
    //     socket.on(SignalEvents.ROOM_EXISTS, this.linkToSocketEvent("signallingroomexists", ["room"]));
    //     socket.on(SignalEvents.ROOM_JOINED, this.linkToSocketEvent("signallingroomjoined", ["room", "clients"]));
    //     socket.on(SignalEvents.ROOM_LEFT, this.linkToSocketEvent("signallingroomleft", ["room", "kicked"]));
    //     socket.on(SignalEvents.ROOM_NOT_EXISTS, this.linkToSocketEvent("signallingroomnotexists", ["room"]));
    //     socket.on(SignalEvents.SIGNAL_RECEIVE, this.linkToSocketEvent("sigallingsignalreceive", ["room", "clientId", "data"]));
    //     socket.on(SignalEvents.TARGET_NOT_FOUND, this.linkToSocketEvent("signallingtargetnotfound", ["room", "clientId"]));
    // }

    // private setupPeerManagerEventRelays(peerManager: PeerManager) {
    //     // TODO: there is probably a better way... with a loop or something
    //     peerManager.addEventListener("rtcconnected", this.linkToPeerManagerEvent("rtcconnected"));
    //     peerManager.addEventListener("rtcdisconnected", this.linkToPeerManagerEvent("rtcdisconnected"));
    //     peerManager.addEventListener("rtcfailed", this.linkToPeerManagerEvent("rtcfailed"));
    //     peerManager.addEventListener("rtcreceivechannelbufferedamountlow", this.linkToPeerManagerEvent("rtcreceivechannelbufferedamountlow"));
    //     peerManager.addEventListener("rtcreceivechannelclose", this.linkToPeerManagerEvent("rtcreceivechannelclose"));
    //     peerManager.addEventListener("rtcreceivechannelerror", this.linkToPeerManagerEvent("rtcreceivechannelerror"));
    //     peerManager.addEventListener("rtcreceivechannelmessage", this.linkToPeerManagerEvent("rtcreceivechannelmessage"));
    //     peerManager.addEventListener("rtcreceivechannelopen", this.linkToPeerManagerEvent("rtcreceivechannelopen"));
    // }

    private setupCommonSocketListeners(socket: SocketIOClient.Socket) {
        // socket.on(SignalEvents.ROOM_LEFT, (room: string, kicked: boolean) => {
        //     console.log(`Left room '${room}'. Kicked: ${kicked}`); // TODO: remove
        // });

        // socket.on(SignalEvents.CLIENT_JOINED, (room: string, clientId: string) => {
        //     console.log(`Client '${clientId}' joined room '${room}'`); // TODO: remove
        // });

        // socket.on(SignalEvents.CLIENT_LEFT, (room: string, clientId: string) => {
        //     console.log(`Client '${clientId}' left room '${room}'`); // TODO: remove
        // });
    }

    private linkToSocketEvent<K extends keyof RoomManagerEventMap>(eventName: K, nameMappings: string[]) {
        // return (event: RoomManagerEventMap[K]) => {
        //     this.emitEvent(eventName, event);
        // }

        return (...args: any[]) => {
            // Convert to object
            const obj = nameMappings.reduce((acc: object, currName: string, idx: number) => {
                return {
                    [currName]: args[idx],
                    ...acc
                };
            }, {});

            // console.log("event", eventName, "OBJ", obj);

            this.emitEvent(eventName, obj as RoomManagerEventMap[K]);
        }
    }

    private linkToPeerManagerEvent<K extends keyof PeerManagerEventMap>(eventName: K) {
        return (event: PeerManagerEventMap[K]) => {
            this.emitEvent(eventName, event as RoomManagerEventMap[K]);
        }

        // return (clientId: string, sourceEvent: any) => {
        //     const event: PeerManagerEvent<any> = { clientId, sourceEvent };
        //     this.emitEvent(eventName, event);
        // }
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

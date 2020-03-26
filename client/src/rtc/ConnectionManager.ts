import Emittable from '@/events/Emittable';
import KEYS from "@/keys";
import Peer from "peerjs";
import axios from "axios";

interface CreateRoomData {
    roomName: string;
    selfId: string;
}

interface GetRoomResponse {
    ownerId: string;
}

interface RoomData {
    roomName: string;
    ownerId: string;
}

interface RoomJoinedData extends RoomData {
    clients: string[];
}

interface PlaySignalData { 
    startLocation: number;
    startTime: number;
}

interface ClientData {
    clientId: string;
    connection: Peer.DataConnection;
}

interface PeerConnections {
    [clientId: string]: ClientData;
}

interface ConnectionManagerEventMap {
    "room-joined": RoomJoinedData;
    "room-created": RoomData;

    "client-joined": ClientData;
    "client-left": ClientData;
    "room-left": RoomData;

    "room-not-exists": string;
    "room-already-exists": string;

    "not-in-room": null;
    "already-in-room": string;

    "error": any;
}

const CHUNK_SIZE = 16384;

export default class ConnectionManager extends Emittable {
    private _id: string;
    private _peer: Peer;
    private _peerConnections: PeerConnections;

    private _roomName: string | null;
    private _roomOwner: string | null;

    constructor() {
        super();

        // TODO: put these out to keys
        const options: Peer.PeerJSOption = {
            host: '/',
            path: "/room-server",
            // key: "synctune",
            port: 3050,
        };

        const peer = new Peer(undefined, options);
        this._peer = peer;

        this._id = peer.id;

        this._peerConnections = {};

        this._roomName = null;
        this._roomOwner = null;

        this.setupPeerListeners(peer);
    }

    private setupPeerListeners(peer: Peer) {
        peer.on("connection", (conn) => { // When a remove peer connects with us
            const clientData = this.addPeerConnection(conn);

            if (this.isOwner) {
                this.emitEvent("client-joined", clientData);
            }
        });
    }

    private addPeerConnection(conn: Peer.DataConnection): ClientData {
        const clientId = conn.peer;

        // Add the peer
        const clientData: ClientData = {
            clientId,
            connection: conn
        };
        this._peerConnections[clientId] = clientData;

        this.setupPeerConnectionListeners(clientId, conn);

        return clientData;
    }

    private setupPeerConnectionListeners(clientId: string, conn: Peer.DataConnection) {
        conn.on("data", (data) => {
            // TODO: implement
            console.log(`Received from ${clientId}:`, data);
        });

        conn.on("open", () => {
            // TODO: implement
        });

        // Note: does not work on firefox!
        // TODO: look into this
        conn.on("close", () => {
            if (!this.isOwner) {
                const data: RoomData = {
                    ownerId: this._roomOwner!,
                    roomName: this._roomName!
                };

                this.emitEvent("room-left", data);

                this._peerConnections = {};
            }
        });

        conn.on("error", (err) => {
            this.emitEvent("error", err);
        });
    }

    async createRoom(roomName: string) {
        if (this.isConnected) {
            this.emitEvent("already-in-room", this._roomName!);
            return;
        }

        const data: CreateRoomData = {
            roomName,
            selfId: this._peer.id
        };

        try {
            // TODO: add to keys
            const res = await axios.post("/room-server/rooms/create", data); // TODO: move out to keys
            
            if (res.status == 200) {
                const data: RoomData = {
                    ownerId: this._id,
                    roomName: roomName
                };

                this._roomName = roomName;
                this._roomOwner = this._id;

                this.emitEvent("room-created", data);
            } else if (res.status == 409) {
                this.emitEvent("room-already-exists", roomName);
            } else {
                throw `Unsupported status code: ${res.status}`;
            }

        } catch(err) {
            this.emitEvent("error", err);
        }
    }

    async joinRoom(roomName: string) {
        if (this.isConnected) {
            this.emitEvent("already-in-room", this._roomName!);
            return;
        }

        try {
            // TODO: add to keys
            const res = await axios.get<GetRoomResponse>(`/room-server/${roomName}`);

            if (res.status == 200) {
                const ownerId = res.data.ownerId;

                const data: RoomJoinedData = {
                    ownerId,
                    roomName,
                    clients: Object.keys(this._peerConnections)
                };

                const peer = this._peer;

                // Connect to the room owner
                const conn = peer.connect(ownerId);

                conn.on("open", () => {
                    this.addPeerConnection(conn);

                    this._roomName = roomName;
                    this._roomOwner = ownerId;

                    this.emitEvent("room-joined", data);
                });

                conn.on("error", (err) => {
                    this.emitEvent("error", err);
                });


            } else if (res.status == 404) {
                this.emitEvent("room-not-exists", roomName);
            } else {
                throw `Unsupported status code: ${res.status}`;
            }
        } catch(err) {
            this.emitEvent("error", err);
        }
    }

    async leaveRoom() {
        if (!this.isConnected) {
            this.emitEvent("not-in-room", null);
            return;
        }

        // Close all peer connections
        Object.values(this._peerConnections).forEach((clientData) => {
            clientData.connection.close();
        });

        // Clear peer connections table
        this._peerConnections = {};

        if (this.isOwner) {
            // Attempt to delete the room on the server
            try {
                // TODO: add to keys
                await axios.delete(`/room-server/${this._roomName!}`);
            } catch(err) {}

            const data: RoomData = {
                ownerId: this._roomOwner!,
                roomName: this._roomName!
            };

            this.emitEvent("room-left", data);
        }
    }

    get id(): string | null {
        return this._id;
    }

    get isOwner(): boolean {
        return this._id === this._roomOwner;
    }

    get isConnected(): boolean {
        return !!this._roomName;
    }

    get room(): string | null {
        return this._roomName;
    }

    get roomOwner(): string | null {
        return this._roomOwner;
    }

    // -------------------------------------
    // --- EventEmitter Method Overrides ---
    // -------------------------------------

    protected emitEvent<K extends keyof ConnectionManagerEventMap>(eventName: K, event: ConnectionManagerEventMap[K]) {
        super.emitEvent(eventName, event);
    }

    addEventListener<K extends keyof ConnectionManagerEventMap>(eventName: K, listener: (event: ConnectionManagerEventMap[K]) => any) {
        super.addEventListener(eventName, listener);
    }

    removeEventListener<K extends keyof ConnectionManagerEventMap>(eventName: K, listener: (event: ConnectionManagerEventMap[K]) => any) {
        super.addEventListener(eventName, listener);
    }
}
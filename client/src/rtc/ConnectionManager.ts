import Emittable from '@/events/Emittable';
import KEYS from "@/keys";
import Peer from "peerjs";
import axios from "axios";
import * as Timesync from "timesync";
import { JsonRpcReceive } from "@/timesync/types";


// --- Audio-Related Types ---

export interface AudioFileMetadata {
    name: string;
    size: number;
    type: string;
}

interface PlaySignalData {
    startLocation: number;
    startTime: number;
}

interface SyncingData {
    audioFile: Blob;
    clients: string[];
}

export interface MessageData {
    type: "timesync" 
        | "audiofilereceived" 
        | "readytoplay" 
        | "play" 
        | "pause" 
        | "stop" 
        | "audiometadata"
        | "audiochunk"
        | "closeconnection";
    data: any;
}

// --- Room-Related Types ---

interface CreateRoomData {
    roomName: string;
    selfId: string;
}

interface GetRoomResponse {
    ownerId: string;
}

export interface RoomData {
    roomName: string;
    ownerId: string;
}

export interface RoomJoinedData extends RoomData {
    clients: string[];
}

interface ClientData {
    clientId: string;
    connection: Peer.DataConnection;
}

interface PeerConnections {
    [clientId: string]: ClientData;
}

// --- Event Map ---

interface ConnectionManagerEventMap {
    "room-joined": RoomJoinedData;
    "room-created": RoomData;
    "room-left": RoomData;

    "client-joined": ClientData;
    "client-left": ClientData;

    "room-not-exists": string;
    "room-already-exists": string;

    "not-in-room": null;
    "already-in-room": string;

    "isconnectedchanged": boolean;

    "error": any;

    // TODO: implement these
    "audiometadatasent": AudioFileMetadata;
    "audiochunksent": ArrayBuffer;
    "audiofilesent": Blob;
    "audiofilesyncing": SyncingData;

    "audiometadatareceived": AudioFileMetadata;
    "audiochunkreceived": ArrayBuffer;
    "audiofilereceived": Blob;

    "playsignalreceived": PlaySignalData;
    "pausesignalreceived": number;
    "stopsignalreceived": number;

    "clientreceivedaudiofile": string;
    "clientreadytoplay": string;
}

const CHUNK_SIZE = 16384;

export default class ConnectionManager extends Emittable {
    private _id: string;
    private _peer: Peer;
    private _peerConnections: PeerConnections;

    private _roomName: string | null;
    private _roomOwner: string | null;

    private _timesync: Timesync;

    private _expectedAudioFileSize: number | null;
    private _receivedChunks: ArrayBuffer[];
    private _receivedSize: number;


    constructor(id: string) {
        super();

        // TODO: put these out to keys
        const options: Peer.PeerJSOption = (process.env.NODE_ENV == "development")? {} : {
            // host: '/',
            // path: "room-server",
            // port: 3050,
            host: KEYS.PEERJS_HOST,
            path: KEYS.PEERJS_PATH,
            port: KEYS.PEERJS_PORT
        };

        const peer = new Peer(id, options);
        this._peer = peer;

        this._id = peer.id;

        this._peerConnections = {};

        this._roomName = null;
        this._roomOwner = null;

        this._expectedAudioFileSize = null;
        this._receivedChunks = [];
        this._receivedSize = 0;

        this._timesync = Timesync.create({
            peers: [],
            interval: null, // Disable automatic synchronization
            delay: 1000,
            repeat: 5,
            timeout: 10000
        });

        this.setupPeerListeners(peer);
        this.setupTimesync(this._timesync);

        window.addEventListener("beforeunload", () => {
            // Leave the room
            this.leaveRoom();
        });
    }

    private setupPeerListeners(peer: Peer) {
        peer.on("connection", (conn) => { // When a remote peer connects with us
            const clientData = this.addPeerConnection(conn);

            conn.on("open", () => {
                if (this.isOwner) {
                    this.emitEvent("client-joined", clientData);
                }
            });
        });
    }

    private setupTimesync(timesync: Timesync) {
        // Override send function to hook up with our data channel as the transport
        timesync.send = (to, data, timeout): Promise<void> => {
            console.log("Timesync: running send");

            return new Promise((resolve, reject) => {
                const sendChannel = this._peerConnections[to].connection;
                if (!sendChannel) {
                    console.log("Timesync: Send rejected, no send channel"); // TODO: remove
                    return reject();
                }

                const messageData: MessageData = {
                    type: "timesync",
                    data: data
                };

                let intervalId: number | null = null;
                if (timeout) {
                    intervalId = setInterval(() => {
                        console.log("Timesync: Rejected for timeout"); // TODO: remove
                        reject();
                    }, timeout);
                }

                try {
                    sendChannel.send(messageData);

                    console.log("Timesync: resolving send message", data); // TODO: remove
                    if (intervalId) clearInterval(intervalId);
                    resolve();
                } catch(err) {
                    console.log("Timesync: Rejecting for error", err); // TODO: remove
                    if (intervalId) clearInterval(intervalId);
                    reject();
                }
            });
        };

        // TODO: remove these
        timesync.on("change", (offset) => {
            console.log('Timesync: New offset', offset); // TODO: remove
        });

        timesync.on("sync", (state) => {
            console.log(`Timesync: new sync state '${state}'`); // TODO: remove
        });

        timesync.on("error", (error) => {
            console.log("Timesync: error", error); // TODO: remove
        });
        
        console.log("timesync", this.timesync); // TODO: remove
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
        conn.on("data", (rawData) => {
            const messageData = rawData as MessageData;

            if (messageData.type !== "audiochunk") console.log("Received message from", clientId, messageData);

            switch(messageData.type) {
                case "audiometadata":
                    try {
                        const metadata = messageData.data as AudioFileMetadata;

                        // Initialize accumulator data
                        this._expectedAudioFileSize = metadata.size;
                        this._receivedChunks = [];
                        this._receivedSize = 0;

                        console.log("ConnectionManager: sending audiometadatareceived"); // TODO: remove

                        this.emitEvent("audiometadatareceived", metadata);
                    } catch(err) {
                        this.emitEvent("error", "Malformed audio metadata object");
                    }

                    break;
                case "audiochunk":
                    const arrBuff = messageData.data as ArrayBuffer;

                    // Add to the list of accumulated chunks for the audio file being received
                    this._receivedChunks.push(arrBuff);
                    this._receivedSize += arrBuff.byteLength;

                    this.emitEvent("audiochunkreceived", arrBuff);

                    if (!this._expectedAudioFileSize) return;

                    // If we have loaded the entire file
                    if (this._receivedSize >= this._expectedAudioFileSize) {
                        // Create the audio file blob and fire the event
                        const dataBlob = new Blob(this._receivedChunks);

                        // Clear accumulator data
                        this._expectedAudioFileSize = null;
                        this._receivedChunks = [];
                        this._receivedSize = 0;

                        this.emitEvent("audiofilereceived", dataBlob);

                        this.sendAudioFileReceivedSignal(this.id!);
                    }

                    break;
                case "play": 
                    const playSignalData = messageData.data as PlaySignalData;
                    this.emitEvent("playsignalreceived", playSignalData);
                    break;
                case "pause":
                    const pauseSentTime = messageData.data as number;
                    this.emitEvent("pausesignalreceived", pauseSentTime);
                    break;
                case "stop": 
                    const stopSentTime = messageData.data as number;
                    this.emitEvent("stopsignalreceived", stopSentTime);
                    break;
                case "audiofilereceived":
                    const afrReceivedClientId = messageData.data as string;
                    this.emitEvent("clientreceivedaudiofile", afrReceivedClientId);
                    break;
                case "readytoplay":
                    const rtpReceivedClientId = messageData.data as string;
                    this.emitEvent("clientreadytoplay", rtpReceivedClientId);
                    break;
                case "closeconnection":
                    const leavingClientID = messageData.data as string;
                    const connection = this._peerConnections[leavingClientID]?.connection;

                    console.log("Received client leaving message to", leavingClientID); // TODO: remove

                    if (connection) {
                        connection.close();
                    }

                    if (!this.isOwner) {
                        const data: RoomData = {
                            ownerId: this._roomOwner!,
                            roomName: this._roomName!
                        };
        
                        this._roomName = null;
                        this._roomOwner = null;

                        // Clear peer connections table
                        this._peerConnections = {};

                        // Clear timesync peer list
                        this._timesync.options.peers = [];

                        this.emitEvent("room-left", data);
        
                        this.emitEvent("isconnectedchanged", false);
                    } else {
                        const clientId = conn.peer;
        
                        const clientData: ClientData = {
                            clientId,
                            connection: conn
                        };
        
                        // Remove the peer from the peer connections map
                        delete this._peerConnections[clientId];

                        // Remove peer from timesync peer list
                        const timesync = this._timesync;
                        const peerList = timesync.options.peers as string[];
                        const peerIdx = peerList.indexOf(clientData.clientId);
                        if (peerIdx > -1) {
                            peerList.splice(peerIdx, 1);
                        }
        
                        this.emitEvent("client-left", clientData);
                    }


                    break;
                case "timesync":
                    console.log(`Timesync: Received timesync message from '${clientId}'`, messageData.data); // TODO: remove

                    // Notify timesync that sync data has been sent to it
                    this._timesync.receive(clientId, messageData.data);
                    break;
            }
        });

        conn.on("open", () => {
            console.log("Data channel ready with", clientId); // TODO: remove

            // Add peer to peer list
            const timesync = this._timesync;
            const peerList = timesync.options.peers as string[];
            if (!peerList.includes(clientId)) {
                peerList.push(clientId);
                console.log("Added peer", clientId, "to timesync", this._timesync); // TODO: remove
            }

            // Run the sync process
            // timesync.sync(); // TODO: fix
        });

        // Note: does not work on firefox!
        // TODO: look into this
        // TODO: remove this?
        conn.on("close", () => {

        });

        conn.on("error", (err) => {
            this.emitEvent("error", err);
        });
    }

    // ----------------------
    // --- Public Methods ---
    // ----------------------

    /**
     * Attempts to crete a room
     *
     * @param room The room name
     */
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
            const res = await axios.post(`${KEYS.ROOM_SERVER_URL}/rooms/create`, data);
            
            if (res.status == 200) {
                const data: RoomData = {
                    ownerId: this._id,
                    roomName: roomName
                };

                this._roomName = roomName;
                this._roomOwner = this._id;

                this.emitEvent("isconnectedchanged", true);

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

    /**
     * Attempts to join a room
     *
     * @param room The room name
     */
    async joinRoom(roomName: string) {
        if (this.isConnected) {
            this.emitEvent("already-in-room", this._roomName!);
            return;
        }

        try {
            // TODO: add to keys
            const res = await axios.get<GetRoomResponse>(`${KEYS.ROOM_SERVER_URL}/rooms/${roomName}`);

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

                console.log('Connecting to peer', ownerId);

                conn.on("open", () => {
                    this.addPeerConnection(conn);

                    this._roomName = roomName;
                    this._roomOwner = ownerId;

                    // Add peer to peer list
                    const timesync = this._timesync;
                    const peerList = timesync.options.peers as string[];
                    if (!peerList.includes(ownerId)) {
                        peerList.push(ownerId);
                        console.log("Added peer", ownerId, "to timesync", this._timesync); // TODO: remove
                    }

                    // Run the sync process
                    // timesync.sync(); // TODO: fix

                    this.emitEvent("isconnectedchanged", true);

                    this.emitEvent("room-joined", data);
                });

                conn.on("error", (err) => {
                    console.log("Error", err);
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


    /**
     * Leaves the current room, if in one
     */
    async leaveRoom() {
        if (!this.isConnected) {
            this.emitEvent("not-in-room", null);
            return;
        }

        // Close all peer connections
        Object.values(this._peerConnections).forEach((clientData) => {
            const connection = clientData.connection;

            // Send close warning signal to other client
            const messageData: MessageData = {
                type: "closeconnection",
                data: this._id
            };
            connection.send(messageData);

            console.log("Sent client leaving message to", clientData.clientId); // TODO: remove
        });

        // Clear peer connections table
        this._peerConnections = {};

        // Clear timesync peer list
        this._timesync.options.peers = [];

        if (this.isOwner) {
            // Attempt to delete the room on the server
            try {
                await axios.delete(`${KEYS.ROOM_SERVER_URL}/rooms/${this._roomName!}`);
                console.log("Successfully deleted room", this._roomName); // TODO: remove
            } catch(err) {
                console.log("Unable to delete room", this._roomName); // TODO: remove
                this.emitEvent("error", `Unable to delete room ${this._roomName}`);
            }
        }

        const data: RoomData = {
            ownerId: this._roomOwner!,
            roomName: this._roomName!
        };

        this._roomName = null;
        this._roomOwner = null;

        this.emitEvent("isconnectedchanged", false);
        this.emitEvent("room-left", data);
    }

    /**
     * Syncs the audio given audio file to all connected clients
     *
     * @param audioFile The audio file blob.
     * @param metadata The metadata for the audio file.
     * @param clients The target clients to sync the audio file to. If not given then all clients are synced.
     */
    syncAudioFile(audioFile: Blob, metadata: AudioFileMetadata, clients?: string[]) {
        if (!this.isConnected) {
            this.emitEvent("error", "Not connected to a room");
            return;
        }

        if (audioFile.size === 0) {
            console.log("Cannot send empty file"); // TODO: handle
            this.emitEvent("error", "Cannot send empty file");
            return;
        }

        const targetClients = clients ? clients : this.clientIds;

        const data: SyncingData = {
            audioFile: audioFile,
            clients: targetClients
        };

        this.emitEvent("audiofilesyncing", data);

        // Send metadata to each client
        targetClients.forEach(clientId => {
            const messageData: MessageData = {
                type: "audiometadata",
                data: metadata
            };

            const sendChannel = this._peerConnections[clientId].connection;
            console.log("metadata: send channel", sendChannel); // TODO: remove
            sendChannel.send(messageData);

            // console.log("Sent metadata to", clientId, metadata); // TODO: remove
        });

        this.emitEvent("audiometadatasent", metadata);

        // --- Send the file ---
        const fileReader = new FileReader();
        let currOffset = 0;

        function readSlice(offset: number) {
            const slice = audioFile.slice(currOffset, offset + CHUNK_SIZE);
            fileReader.readAsArrayBuffer(slice);
        }

        fileReader.addEventListener("load", event => {
            const chunk = event.target?.result as ArrayBuffer;

            const messageData: MessageData = {
                type: "audiochunk",
                data: chunk
            };

            // Send chunk to each client
            targetClients.forEach(clientId => {
                const sendChannel = this._peerConnections[clientId].connection;
                sendChannel.send(messageData);

                // console.log("Sent chunk to", clientId, chunk); // TODO: remove
            });

            currOffset += chunk.byteLength;

            this.emitEvent("audiochunksent", chunk);

            // If we still have more file to send, read the next chunk
            if (currOffset < audioFile.size) {
                readSlice(currOffset);
            } else {
                // The entire file is sent
                console.log("Audio file sent"); // TODO: remove
                this.emitEvent("audiofilesent", audioFile);
            }
        });

        // Begin reading the audio file
        readSlice(0);
    }

    /**
     * Sends the play signal to the clients
     *
     * @param startLocation The location in the song to start at
     * @param delay How far in the future the start time signal should be set (in milliseconds)
     *
     * @return Returns the start timestamp
     */
    sendPlaySignal(startLocation: number, delay = 100): number {
        if (!this.isConnected) {
            this.emitEvent("error", "Not connected to a room");
            return -1;
        }

        const timesync = this._timesync;
        const now = timesync.now();
        // TODO: use synced time
        // const now = Date.now();
        const startTime = now + delay;

        const data: PlaySignalData = {
            startLocation,
            startTime
        };

        const messageData: MessageData = {
            type: "play",
            data
        };

        const clients = this.clientIds;
        clients.forEach(clientId => {
            if (clientId === this._id) return;

            const sendChannel = this._peerConnections[clientId].connection;
            sendChannel.send(messageData);
        });

        console.log("sending play signal"); // TODO: remove

        // Send play signal to self
        this.emitEvent("playsignalreceived", data);

        return startTime;
    }

    /**
     * Sends the pause signal to all connected clients
     */
    sendPauseSignal() {
        if (!this.isConnected) {
            this.emitEvent("error", "Not connected to a room");
            return -1;
        }

        // TODO: use synced time
        const now = Date.now();

        const messageData: MessageData = {
            type: "pause",
            data: now
        };

        const clients = this.clientIds;
        clients.forEach(clientId => {
            if (clientId === this._id) return;

            const sendChannel = this._peerConnections[clientId].connection;
            sendChannel.send(messageData);
        });

        // Send pause signal to self
        this.emitEvent("pausesignalreceived", now);
    }

    /**
     * Sends the stop signal to all connected clients
     */
    sendStopSignal() {
        if (!this.isConnected) {
            this.emitEvent("error", "Not connected to a room");
            return -1;
        }

        // TODO: use synced time
        const now = Date.now();

        const messageData: MessageData = {
            type: "stop",
            data: now
        };

        const clients = this.clientIds;
        clients.forEach(clientId => {
            if (clientId === this._id) return;

            const sendChannel = this._peerConnections[clientId].connection;
            sendChannel.send(messageData);
        });

        // Send stop signal to self
        this.emitEvent("stopsignalreceived", now);
    }

    /**
     * Sends the audiofilereceived signal to all RTC connections
     * 
     * @param selfId The id of self
     */
    sendAudioFileReceivedSignal(selfId: string) {
        this.clientIds.forEach(otherId => {
            const syncSendChannel = this._peerConnections[otherId].connection;

            if (!syncSendChannel) {
                console.log("Unable to send audio receive signal to", otherId); // TODO: remove
                this.emitEvent("error", `Unable to send audio receive signal to ${otherId}`);
                return;
            }

            console.log("Sending audiofilereceived to", otherId); // TODO: remove

            const messageData: MessageData = {
                type: "audiofilereceived",
                data: selfId
            }

            syncSendChannel.send(messageData);
        });
    }

    /**
     * Sends the readytoplay signal to all RTC connections
     * 
     * @param selfId The id of self
     */
    sendReadyToPlaySignal(selfId: string) {
        this.clientIds.forEach(otherId => {
            const syncSendChannel = this._peerConnections[otherId].connection;

            if (!syncSendChannel) {
                console.log("Unable to send ready to play signal to", otherId); // TODO: remove
                this.emitEvent("error", `Unable to send ready to play signal to ${otherId}`);
                return;
            }

            console.log("Sending readytoplay to", otherId); // TODO: remove

            const messageData: MessageData = {
                type: "readytoplay",
                data: selfId
            }

            syncSendChannel.send(messageData);
        });
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

    get isConnected(): boolean {
        return !!this._roomName;
    }

    get room(): string | null {
        return this._roomName;
    }

    get roomOwner(): string | null {
        return this._roomOwner;
    }

    get timesync(): Timesync {
        return this._timesync;
    }

    get clientIds(): string[] {
        return Object.keys(this._peerConnections);
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
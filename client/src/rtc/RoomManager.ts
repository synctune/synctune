// eslint-disable-next-line @typescript-eslint/no-unused-vars
import adapter from 'webrtc-adapter';
import Emittable from '@/events/Emittable';
import PeerManager, { SyncChannelMessage } from "@/rtc/PeerManager";
import SignallingSocket from '@/socket/SignallingSocket';
import KEYS from "@/keys";
import io from "socket.io-client";

// TODO: implement this?
type RoomManagerStatus = "connected" | "disconnected";

export interface AudioFileMetadata {
    name: string;
    size: number;
    type: string;
}

interface PlaySignalData { 
    startLocation: number;
    startTime: number;
}

interface RoomManagerEventMap {
    "peermanagercreated": PeerManager;

    "audiometadatasent": AudioFileMetadata;
    "audiochunksent": ArrayBuffer;
    "audiofilesent": Blob;
    "audiofilesyncing": Blob;

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

export default class RoomManager extends Emittable {
    private socket: SignallingSocket;
    private _id: string | null;

    private _room: string | null;
    private _roomOwner: string | null;

    private _peerManager: PeerManager | null;

    private _expectedAudioFileSize: number | null;
    private _receivedChunks: ArrayBuffer[];
    private _receivedSize: number;

    constructor() {
        super();

        // Create a socket connection
        const socket = io(`/`, { path: `/${KEYS.SIGNALLING_SERVER_SOCKET_IO_PATH}` });

        this._room = null;
        this._roomOwner = null;
        this._peerManager = null;

        this.socket = socket;
        this._id = null;

        this._expectedAudioFileSize = null;
        this._receivedChunks = [];
        this._receivedSize = 0;

        this.setupSignallingSocketListeners(socket);

        socket.on("connect", () => {
            this._id = socket.id;
        });

        window.addEventListener("beforeunload", () => {
            // Leave the room
            this.leaveRoom();
        });

        this.addEventListener("peermanagercreated", (peerManager) => {
            this.setupPeerManagerListeners(peerManager);
        });
    }


    // -----------------------
    // --- Private Helpers ---
    // -----------------------

    private setupSignallingSocketListeners(socket: SignallingSocket) {
        socket.on("room-left", () => {
            // Disconnect all peers
            this._peerManager?.disconnectAll();
        });

        socket.on("client-left", (_, clientId) => {
            // Disconnect the client's RTC connection
            this._peerManager?.disconnectRTC(clientId);
        });
    }

    private createPeerManager(socket: SocketIOClient.Socket, room: string) {
        // Create the peer manager and setup event relays
        this._peerManager = new PeerManager(socket, room);

        this.emitEvent("peermanagercreated", this._peerManager);
    }

    private setupPeerManagerListeners(peerManager: PeerManager) {
        peerManager.addEventListener("audioreceivechannelready", ({ sourceEvent: audioReceiveChannel}) => {
            // Setup audio file receiving
            audioReceiveChannel.addEventListener("message", ({ data }) => {
                // console.log("Received data", data); // TODO: remove

                if (typeof data === "string") {
                    try {
                        const metadata = JSON.parse(data) as unknown as AudioFileMetadata;

                        // Initialize accumulator data
                        this._expectedAudioFileSize = metadata.size;
                        this._receivedChunks = [];
                        this._receivedSize = 0;

                        this.emitEvent("audiometadatareceived", metadata);

                    } catch(err) {
                        console.log("Malformed audio metadata object"); // TODO: handle
                    }
                } else if (data instanceof ArrayBuffer) {
                    // Add to the list of accumulated chunks for the audio file being received
                    this._receivedChunks.push(data);
                    this._receivedSize += data.byteLength;

                    this.emitEvent("audiochunkreceived", data);

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

                        peerManager.sendAudioFileReceivedSignal(this._id!);
                    }
                }
            });
        });

        peerManager.addEventListener("rtcconnected", ({ clientId }) => {
            // TODO: remove
        });

        peerManager.addEventListener("syncreceivechannelready", ({ clientId }) => {
            console.log("Sync channel ready with", clientId); // TODO: remove

            // Add peer to peer list
            const peerList = peerManager.timesync.options.peers as string[];
            peerList.push(clientId);

            console.log("Added peer", clientId, "to timesync"); // TODO: remove
            console.log(peerManager.timesync);

            // TODO: fix this so we don't have delay the call like this
            // setTimeout(() => {
            //     // Sync clocks
            //     peerManager.timesync.sync(); // TODO: do something about that
            // }, 3000);

            // peerManager.timesync.sync();
        });

        peerManager.addEventListener("syncreceivechannelready", ({ sourceEvent: syncReceiveChannel }) => {
            // Setup play/stop signal receive listener
            syncReceiveChannel.addEventListener("message", (event) => {
                try {
                    const message: SyncChannelMessage = JSON.parse(event.data) as unknown as SyncChannelMessage;

                    switch(message.type) {
                        case "play":
                            const data = message.data as PlaySignalData;
                            this.emitEvent("playsignalreceived", data);
                            break;
                        case "pause":
                            const pauseSentTime = message.data as number;
                            this.emitEvent("pausesignalreceived", pauseSentTime);
                            break;
                        case "stop":
                            const stopSentTime = message.data as number;
                            this.emitEvent("stopsignalreceived", stopSentTime);
                            break;
                        case "audiofilereceived":
                            const afrReceivedClientId = message.data as string;
                            this.emitEvent("clientreceivedaudiofile", afrReceivedClientId);
                            break;
                        case "readytoplay":
                            const rtpReceivedClientId = message.data as string;
                            this.emitEvent("clientreadytoplay", rtpReceivedClientId);
                            break;
                    }
                } catch(err) {
                    // Ignore any parsing/casting fails, it means that a malformed message was sent
                    console.log("Malformed message was sent", event.data); // TODO: remove
                }
            });
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
            this.socket.emit("room-leave", this._room);
        }
    }

    /**
     * Syncs the audio given audio file to all connected clients
     * 
     * @param audioFile The audio file blob.
     * @param metadata The metadata for the audio file.
     * @param clients The target clients to sync the audio file to. If not given then all clients are synced.
     */
    syncAudioFile(audioFile: Blob, metadata: AudioFileMetadata, clients?: string[]) {
        // TODO: reference https://webrtc.github.io/samples/src/content/datachannel/filetransfer/

        if (audioFile.size === 0) {
            console.log("Cannot send empty file"); // TODO: handle
            return;
        }

        if (!this.peerManager) {
            console.log("Peer manager not connected"); // TODO: handle
            return;
        }

        this.emitEvent("audiofilesyncing", audioFile);

        const targetClients = (clients) ? clients : this.peerManager.clients;

        // --- Send the file metadata ---
        // const metadata: AudioFileMetadata = {
        //     name: audioFile.name,
        //     size: audioFile.size,
        //     type: audioFile.type
        // }

        // Send metadata to each client
        targetClients.forEach(clientId => {
            const sendChannel = this.peerManager!.getSendChannel(clientId, "audioChannel", true);
            console.log("metadata: send channel", sendChannel); // TODO: remove
            sendChannel!.send(JSON.stringify(metadata));

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

            // Send chunk to each client
            targetClients.forEach(clientId => {
                const sendChannel = this.peerManager!.getSendChannel(clientId, "audioChannel", true)!;
                sendChannel.send(chunk);

                // console.log("Sent chunk to", clientId, chunk); // TODO: remove
            });

            currOffset += chunk.byteLength;

            this.emitEvent("audiochunksent", chunk);

            // If we still have more file to send, read the next chunk
            if (currOffset < audioFile.size) {
                readSlice(currOffset);
            } else { // The entire file is sent
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
        if (!this.peerManager) {
            console.log("Peer manager not connected"); // TODO: handle
            return -1;
        }

        const timesync = this.peerManager.timesync;
        const now = timesync.now();
        // TODO: use synced time
        // const now = Date.now();
        const startTime = now + delay;

        const data: PlaySignalData = {
            startLocation,
            startTime
        };

        const message: SyncChannelMessage = {
            type: "play",
            data
        };

        const clients = this.peerManager.clients;
        clients.forEach(clientId => {
            if (clientId === this._id) return;

            const sendChannel = this.peerManager!.getSendChannel(clientId, "syncChannel", true)!;
            sendChannel.send(JSON.stringify(message));
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
        if (!this.peerManager) {
            console.log("Peer manager not connected"); // TODO: handle
            return -1;
        }

        // TODO: use synced time
        const now = Date.now();

        const message: SyncChannelMessage = {
            type: "pause",
            data: now
        };

        const clients = this.peerManager.clients;
        clients.forEach(clientId => {
            if (clientId === this._id) return;

            const sendChannel = this.peerManager!.getSendChannel(clientId, "syncChannel", true)!;
            sendChannel.send(JSON.stringify(message));
        });

        // Send pause signal to self
        this.emitEvent("pausesignalreceived", now);
    }

    /**
     * Sends the stop signal to all connected clients
     */
    sendStopSignal() {
        if (!this.peerManager) {
            console.log("Peer manager not connected"); // TODO: handle
            return -1;
        }

        // TODO: use synced time
        const now = Date.now();

        const message: SyncChannelMessage = {
            type: "stop",
            data: now
        };

        // console.log("Peermanager", this.peerManager); // TODO: remove

        const clients = this.peerManager.clients;
        clients.forEach(clientId => {
            if (clientId === this._id) return;

            const sendChannel = this.peerManager!.getSendChannel(clientId, "syncChannel", false)!;
            // const sendChannel = this.peerManager!.getSendChannel(clientId, "syncChannel", true)!;
            // console.log("stop signal: send channel", clientId, this._id, sendChannel);
            sendChannel.send(JSON.stringify(message));
        });

        // Send stop signal to self
        this.emitEvent("stopsignalreceived", now);
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

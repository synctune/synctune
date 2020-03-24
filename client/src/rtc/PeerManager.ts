// eslint-disable-next-line @typescript-eslint/no-unused-vars
import adapter from 'webrtc-adapter';
import Emittable from "@/events/Emittable";
import {} from "socket.io-client";
import RTCDataContainer from "@/rtc/RTCDataContainer";
import SignallingSocket from '@/socket/SignallingSocket';
import * as Timesync from "timesync";
import { JsonRpcReceive } from "@/timesync/types";
 
type ChannelType = "syncChannel" | "audioChannel";

interface PeerObject {
    peer: RTCPeerConnection;
    syncSendChannel: RTCDataChannel;
    syncReceiveChannel?: RTCDataChannel;
    audioSendChannel: RTCDataChannel;
    audioReceiveChannel?: RTCDataChannel;
}

interface PeersMap {
    [clientId: string]: PeerObject;
}

export interface PeerManagerEvent<T> {
    clientId: string;
    sourceEvent: T;
}

export interface SyncChannelMessage {
    type: "timesync" | "audiofilereceived" | "readytoplay" | "play" | "pause" | "stop";
    data: any;
}

export interface PeerManagerEventMap {
    "rtcconnected": PeerManagerEvent<Event>;
    "rtcdisconnected": PeerManagerEvent<Event | null>;
    "rtcfailed": PeerManagerEvent<Event>;

    "syncreceivechannelready": PeerManagerEvent<RTCDataChannel>;
    "audioreceivechannelready": PeerManagerEvent<RTCDataChannel>;
    "datachannelsready": PeerManagerEvent<null>;
}

const sendChannelMap = {
    ["syncChannel" as ChannelType]: "syncSendChannel",
    ["audioChannel" as ChannelType]: "audioSendChannel"
}

const receiveChannelMap = {
    ["syncChannel" as ChannelType]: "syncReceiveChannel",
    ["audioChannel" as ChannelType]: "audioReceiveChannel"
}

export default class PeerManager extends Emittable {
    private socket: SignallingSocket;
    private room: string;

    private rtcPeers: PeersMap;

    private _timesync: Timesync;

    constructor(socket: SignallingSocket, room: string) {
        super();

        this.socket = socket;
        this.room = room;

        this.rtcPeers = {};
        this.listeners = {};

        this._timesync = Timesync.create({
            peers: [],
            interval: null, // Disable automatic synchronization
            delay: 1000,
            repeat: 5,
            timeout: 10000
        });

        this.setupTimesync(this._timesync);
        this.setupSocketListeners(socket);
    }

    
    // -----------------------
    // --- Private Helpers ---
    // -----------------------

    /**
     * Setups up the timesync object and listeners
     */
    private setupTimesync(timesync: Timesync) {
        // Override send function to hook up with our data channel as the transport
        timesync.send = (to, data, timeout): Promise<void> => {
            console.log("Timesync: running send");

            return new Promise((resolve, reject) => {
                const sendChannel = this.getSendChannel(to, "syncChannel", false);
                if (!sendChannel) {
                    console.log("Timesync: Send rejected, no send channel"); // TODO: remove
                    return reject();
                }

                const message: SyncChannelMessage = {
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
                    sendChannel.send(JSON.stringify(message));

                    console.log("Timesync: resolving send message"); // TODO: remove
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
            console.log('Timesync: New offset', offset);
        });

        timesync.on("sync", (state) => {
            console.log(`Timesync: new sync state '${state}'`);
        });

        timesync.on("error", (error) => {
            console.log("Timesync: error", error);
        });
        
        console.log("timesync", this.timesync); // TODO: remove
    }

    /**
     * Sets up listeners to the given socket
     * 
     * @param socket The socket 
     */
    private setupSocketListeners(socket: SignallingSocket) {
        socket.on("signal-receive", async (room: string, senderId: string, data: RTCDataContainer) => {
            console.log("Received signal from", senderId); // TODO: remove

            // TODO: credit this: https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
            try {
                const { description, candidate } = data;

                // Get the peer connection with the sender, creating it if need be
                const pc = this.getPeerConnection(senderId, true)!;

                // If a description was received
                if (description) {
                    switch(description.type) {
                        // If an offer is received then reply with an answer
                        case "offer":
                            await pc.setRemoteDescription(description);

                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);

                            // Send back the answer
                            this.socket.emit("signal-send", this.room, senderId, { description: answer });

                            break;
                        // Just update remote description with answer 
                        case "answer":
                            await pc.setRemoteDescription(description);

                            break;
                        default:
                            // TODO: handle error properly
                            console.error('Unsupported SDP type.');
                    }
                } 
                // If a candidate was received instead then add it
                else if (candidate) {
                    await pc.addIceCandidate(candidate);
                }
            } catch(err) {
                // TODO: handle error properly
                console.error(err);
            }
        });
    }

    /**
     * Cleans up the closed peer for the given client
     * 
     * @param clientId The client id
     */
    private cleanupClosedPeer(clientId: string) {
        // Cleanup event listeners
        const peerObj = this.getPeerObject(clientId, false);

        if (peerObj) {
            peerObj.peer.onicecandidate = null;
            peerObj.peer.onconnectionstatechange = null;

            // Remove peer connection from the peer objects
            delete this.rtcPeers[clientId];
        }
    }

    /**
     * Creates and sets up a peer object with the given client id. 
     * Note: will overwrite if one already exists.
     * 
     * @param clientId The client id
     */
    private createPeerObject(clientId: string) {
        const pc = new RTCPeerConnection();

        pc.addEventListener("icecandidate", ({ candidate }) => {
            const candidateCleaned = (candidate) ? candidate : undefined;
            this.socket.emit("signal-send", this.room, clientId, { candidate: candidateCleaned });
        });

        // Setup data channels
        const syncSendChannel = pc.createDataChannel("syncChannel" as ChannelType);

        const audioSendChannel = pc.createDataChannel("audioChannel" as ChannelType);
        audioSendChannel.binaryType = "arraybuffer";

        let numChannelsReady = 0;

        // Setup receive channel
        pc.addEventListener("datachannel", (event) => {
            console.log("Received data channel", event.channel.label); // TODO: remove

            const channelName = event.channel.label as ChannelType;
            const receiveChannel = event.channel;

            switch(channelName) {
                case "syncChannel":
                    this.rtcPeers[clientId].syncReceiveChannel = receiveChannel;
                    this.emitEvent("syncreceivechannelready", { clientId, sourceEvent: receiveChannel });
                    numChannelsReady++;

                    // Add listener that calls timesync.receive whenever it gets data for it
                    receiveChannel.addEventListener("message", (event) => {
                        try {
                            const message: SyncChannelMessage = JSON.parse(event.data) as unknown as SyncChannelMessage;
                            
                            if (message.type === "timesync") {
                                const data = message.data as JsonRpcReceive;

                                // console.log(`Timesync: Received timesync message from '${clientId}'`, data); // TODO: remove

                                // Notify timesync that sync data has been sent to it
                                this._timesync.receive(clientId, data);
                            }
                        } catch(err) {
                            // Ignore any parsing/casting fails, it means that a malformed message was sent
                            console.log("Malformed message was sent", event.data); // TODO: remove
                        }
                    });

                    break;
                case "audioChannel":
                    receiveChannel.binaryType = "arraybuffer";
                    this.rtcPeers[clientId].audioReceiveChannel = receiveChannel;
                    this.emitEvent("audioreceivechannelready", { clientId, sourceEvent: receiveChannel });
                    numChannelsReady++;

                    break;
            }

            // If both the data channels are ready
            if (numChannelsReady === 2) {
                this.emitEvent("datachannelsready", { clientId, sourceEvent: null });
            }
        });

        pc.addEventListener("iceconnectionstatechange", (event) => {
            console.log("iceconnectionstatechange", pc.iceConnectionState); // TODO: remove

            switch(pc.iceConnectionState) {
                case "new":
                    break;
                case "checking":
                    break;
                case "connected":
                    this.emitEvent("rtcconnected", { clientId, sourceEvent: event });
                    console.log("rtcconnected", pc, audioSendChannel); // TODO: remove
                    break;
                case "completed":
                    break;
                case "disconnected":
                    this.cleanupClosedPeer(clientId);
                    this.emitEvent("rtcdisconnected", { clientId, sourceEvent: event });
                    break;
                case "failed":
                    this.emitEvent("rtcfailed", { clientId, sourceEvent: event });
                    break;
                case "closed":
                    this.cleanupClosedPeer(clientId);
                    this.emitEvent("rtcdisconnected", { clientId, sourceEvent: event });
                    break;
            }
        });
        
        // Update the rtc peer map
        this.rtcPeers[clientId] = {
            peer: pc,
            syncSendChannel: syncSendChannel,
            audioSendChannel: audioSendChannel
        };
    }

    /**
     * Gets the peer object of thr given client
     * 
     * @param clientId The client id
     * @param createIfMissing Create the peer connection if it is missing 
     */
    private getPeerObject(clientId: string, createIfMissing = true): PeerObject | null {
        // No peer object, create it if allowed
        if (!this.hasPeerObject(clientId) && createIfMissing) {
            this.createPeerObject(clientId);
        }

        return this.rtcPeers[clientId];
    }


    // ----------------------
    // --- Public Methods ---
    // ----------------------

    /**
     * Initializes an RTC connection process with a client in the room
     * 
     * @param clientId The target client id
     */
    async connectRTC(clientId: string): Promise<void> {
        // Get peer connection, creating it if need be
        const pc = this.getPeerConnection(clientId, true)!;

        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Send offer to client
        this.socket.emit("signal-send", this.room, clientId, { description: offer });
    }

    /**
     * Closes an RTC connection with a client in the room
     * 
     * @param clientId The target client id
     */
    disconnectRTC(clientId: string): void {
        const peerObj = this.getPeerObject(clientId, false);

        if (!peerObj) return;

        // Close channels
        peerObj.syncSendChannel.close();
        peerObj.syncReceiveChannel?.close();
        peerObj.audioSendChannel.close();
        peerObj.audioReceiveChannel?.close();

        peerObj.peer.close();

        this.cleanupClosedPeer(clientId);
        this.emitEvent("rtcdisconnected", { clientId, sourceEvent: null });
    }

    /**
     * Disconnect from all clients
     */
    disconnectAll(): void {
        Object.keys(this.rtcPeers).forEach(clientId => this.disconnectRTC(clientId));
    }

    /**
     * Returns if an RTC peer connection object exists with the given client
     * 
     * @param clientId The client id
     */
    hasPeerObject(clientId: string): boolean {
        return !!this.rtcPeers[clientId];
    }

    /**
     * Get the RTC peer connection to the given client
     * 
     * @param clientId The client id
     * @param createIfMissing Create the peer connection if it is missing
     */
    getPeerConnection(clientId: string, createIfMissing = true): RTCPeerConnection | null {
        const peerObject = this.getPeerObject(clientId, createIfMissing);

        if (!peerObject) return null;
        return peerObject.peer; // ? is called "optional-chaining"
    }

    /**
     * Get the RTC send data channel to the given client and type
     * 
     * @param clientId The client id
     * @param type The channel type
     * @param createIfMissing Create the peer connection if it is missing
     */
    getSendChannel(clientId: string, type: ChannelType, createIfMissing = true): RTCDataChannel | null {
        const peerObject = this.getPeerObject(clientId, createIfMissing);
        if (!peerObject) return null;
        const sendChannel = peerObject[sendChannelMap[type] as keyof PeerObject] as RTCDataChannel;
        return (sendChannel) ? sendChannel : null;
    }

    /**
     * Get the RTC data receive channel to the given client and type
     * 
     * @param clientId The client id
     * @param type The channel type
     * @param createIfMissing Create the peer connection if it is missing
     */
    getReceiveChannel(clientId: string, type: ChannelType, createIfMissing = true): RTCDataChannel | null {
        const peerObject = this.getPeerObject(clientId, createIfMissing);
        if (!peerObject) return null;
        const receiveChannel = peerObject[receiveChannelMap[type] as keyof PeerObject] as RTCDataChannel;
        return (receiveChannel) ? receiveChannel : null;
    }

    /**
     * Sends the audiofilereceived signal to all RTC connections
     * 
     * @param selfId The id of self
     */
    sendAudioFileReceivedSignal(selfId: string) {
        this.clients.forEach(otherId => {
            const syncSendChannel = this.getSendChannel(otherId, "syncChannel", true);

            console.log("Sending audiofilereceived to", otherId); // TODO: remove

            const message: SyncChannelMessage = {
                type: "audiofilereceived",
                data: selfId
            }

            syncSendChannel!.send(JSON.stringify(message));
        });
    }

    /**
     * Sends the readytoplay signal to all RTC connections
     * 
     * @param selfId The id of self
     */
    sendReadyToPlaySignal(selfId: string) {
        this.clients.forEach(otherId => {
            const syncSendChannel = this.getSendChannel(otherId, "syncChannel", true);

            console.log("Sending readytoplay to", otherId); // TODO: remove

            const message: SyncChannelMessage = {
                type: "readytoplay",
                data: selfId
            }

            syncSendChannel!.send(JSON.stringify(message));
        });
    }

    /**
     * The timesync object
     */
    get timesync(): Timesync {
        return this._timesync;
    }

    /**
     * The ids of all the connected RTC clients
     */
    get clients(): string[] {
        return Object.keys(this.rtcPeers);
    }


    // -------------------------------------
    // --- EventEmitter Method Overrides ---
    // -------------------------------------

    protected emitEvent<K extends keyof PeerManagerEventMap>(eventName: K, event: PeerManagerEventMap[K]) {
        super.emitEvent(eventName, event);
    }
    
    addEventListener<K extends keyof PeerManagerEventMap>(event: K, listener: (event: PeerManagerEventMap[K]) => any) {
        super.addEventListener(event, listener);
    }

    removeEventListener<K extends keyof PeerManagerEventMap>(event: K, listener: (event: PeerManagerEventMap[K]) => any) {
        super.removeEventListener(event, listener);
    }
}
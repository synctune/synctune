// eslint-disable-next-line @typescript-eslint/no-unused-vars
import adapter from 'webrtc-adapter';
import Emittable from "@/events/Emittable";
import {} from "socket.io-client";
import RTCDataContainer from "@/rtc/RTCDataContainer";
import SignallingSocket from '@/socket/SignallingSocket';
import * as Timesync from "timesync";

type ChannelType = "syncChannel" | "audioChannel";

interface PeerObject {
    peer: RTCPeerConnection;
    syncSendChannel: RTCDataChannel;
    syncReceiveChannel?: RTCDataChannel;
    audioSendChannel: RTCDataChannel;
    audioReceiveChannel?: RTCDataChannel;

    // sendChannel: RTCDataChannel;
    // receiveChannel?: RTCDataChannel;
}

interface PeersMap {
    [clientId: string]: PeerObject;
}

export interface PeerManagerEvent<T> {
    clientId: string;
    sourceEvent: T;
}

// interface PeerManagerMessageData {
//     type: "timesync" | "audiofile" | "audiolink" | "other";
//     data: any;
// }

interface SyncChannelMessage {
    type: "timesync" | "play" | "stop";
    data: any;
}

interface JsonRpcSend {
    "jsonrpc": "2.0";
    "id": string;
    "method": "timesync";
}

interface JsonRpcReceive {
    "jsonrpc": "2.0";
    "id": string;
    "result": number;
}

export interface PeerManagerEventMap {
    // "rtcaudioreceivechannelbufferedamountlow": PeerManagerEvent<Event>;
    // "rtcaudioreceivechannelclose": PeerManagerEvent<Event>;
    // "rtcaudioreceivechannelerror": PeerManagerEvent<RTCErrorEvent>;
    // "rtcaudioreceivechannelmessage": PeerManagerEvent<MessageEvent>;
    // "rtcaudioreceivechannelopen": PeerManagerEvent<Event>;

    // "rtcsyncreceivechannelbufferedamountlow": PeerManagerEvent<Event>;
    // "rtcsyncreceivechannelclose": PeerManagerEvent<Event>;
    // "rtcsyncreceivechannelerror": PeerManagerEvent<RTCErrorEvent>;
    // "rtcsyncreceivechannelmessage": PeerManagerEvent<MessageEvent>;
    // "rtcsyncreceivechannelopen": PeerManagerEvent<Event>;

    // "rtcreceivechannelbufferedamountlow": PeerManagerEvent<Event>;
    // "rtcreceivechannelclose": PeerManagerEvent<Event>;
    // "rtcreceivechannelerror": PeerManagerEvent<RTCErrorEvent>;
    // "rtcreceivechannelmessage": PeerManagerEvent<MessageEvent>;
    // "rtcreceivechannelopen": PeerManagerEvent<Event>;
    "rtcconnected": PeerManagerEvent<Event>;
    "rtcdisconnected": PeerManagerEvent<Event>;
    "rtcfailed": PeerManagerEvent<Event>;

    "syncreceivechannelcreated": PeerManagerEvent<RTCDataChannel>;
    "audioreceivechannelcreated": PeerManagerEvent<RTCDataChannel>;
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

    // private timesync: Timesync;

    constructor(socket: SignallingSocket, room: string) {
        super();

        this.socket = socket;
        this.room = room;

        this.rtcPeers = {};
        this.listeners = {};

        // this.timesync = Timesync.create({
        //     peers: [],
        //     interval: null, // Disable automatic synchronization
        //     delay: 1000,
        //     repeat: 5,
        //     timeout: 10000
        // });

        // this.setupTimesync();
        this.setupSocketListeners(socket);
    }

    
    // -----------------------
    // --- Private Helpers ---
    // -----------------------

    /**
     * Setups up the timesync object and listeners
     */
    // private setupTimesync() {
    //     const timesync = this.timesync;

    //     // Override send function to hook up with our data channel as the transport
    //     // timesync.send = (to: string, data: JsonRpcSend, timeout: number): Promise<void> => {
    //     //     return new Promise((resolve, reject) => {
    //     //         const sendChannel = this.getSendChannel(to, "syncChannel", true);
    //     //         if (!sendChannel) return reject();

    //     //         const message: SyncChannelMessage = {
    //     //             type: "timesync",
    //     //             data: data
    //     //         };

    //     //         sendChannel.send(JSON.stringify(message));
    //     //     });
    //     // };


    //     timesync.on("change", (offset) => {
    //         console.log('Timesync: New offset', offset);
    //     });

    //     timesync.on("sync", (state) => {
    //         console.log(`Timesync: new sync state '${state}'`);
    //     });

    //     timesync.on("error", (error) => {
    //         console.log("Timesync: error", error);
    //     });
        
    //     console.log("timesync", this.timesync); // TODO: remove
    // }

    // private getChannelEventPrefix(channelName: ChannelNames): "rtcaudio" | "rtcsync" | null {
    //     if (channelName === ChannelNames.AUDIO_RECEIVE_CHANNEL || channelName === ChannelNames.AUDIO_SEND_CHANNEL) return "rtcaudio";
    //     if (channelName === ChannelNames.SYNC_RECEIVE_CHANNEL || channelName === ChannelNames.SYNC_SEND_CHANNEL) return "rtcsync";
    //     return null;
    // }

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

        // socket.on("client-joined", (_, clientId) => {
        //     const timesync = this.timesync;

        //     // Add the client to the peers list
        //     const peers = timesync.options.peers as string[];
        //     peers.push(clientId);

        //     // TODO: Synchronize clocks
        // });

        // socket.on("client-left", (_, clientId) => {
        //     const timesync = this.timesync;

        //     // Remove the client from the peers list
        //     const peers = timesync.options.peers as string[];
        //     const idx = peers.indexOf(clientId);
        //     if (idx >= 0) peers.splice(idx, 1);

        //     // TODO: Synchronize clocks
            
        // });
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

        // Setup data channel
        // const sendChannel = pc.createDataChannel("sendDataChannel");

        // Setup sync data channel
        const syncSendChannel = pc.createDataChannel("syncChannel" as ChannelType);

        const audioSendChannel = pc.createDataChannel("audioChannel" as ChannelType);
        audioSendChannel.binaryType = "arraybuffer";

        // Setup receive channel
        pc.addEventListener("datachannel", (event) => {
            console.log("Received data channel", event.channel.label); // TODO: remove

            const channelName = event.channel.label as ChannelType;
            const receiveChannel = event.channel;

            // this.rtcPeers[clientId].receiveChannel = receiveChannel;

            // Store receive channel
            // this.rtcPeers[clientId][channelName] = receiveChannel;

            switch(channelName) {
                case "audioChannel":
                    this.rtcPeers[clientId].syncReceiveChannel = receiveChannel;
                    this.emitEvent("syncreceivechannelcreated", { clientId, sourceEvent: receiveChannel });

                    // Add listener that calls timesync.receive whenever it gets data for it
                    // receiveChannel.addEventListener("message", (event) => {
                    //     try {
                    //         const message: SyncChannelMessage = JSON.stringify(event.data) as unknown as SyncChannelMessage;
                            
                    //         if (message.type === "timesync") {
                    //             const data = message.data as JsonRpcReceive;

                    //             console.log(`>> Received timesync message from '${clientId}'`, data);

                    //             // Notify timesync that sync data has been sent to it
                    //             this.timesync.receive(clientId, data);
                    //         }
                    //     } catch(err) {
                    //         // Ignore any parsing/casting fails, it means that a malformed message was sent
                    //         console.log("Malformed message was sent", event.data); // TODO: remove
                    //     }
                    // });

                    // receiveChannel.addEventListener("open", this.linkToEventEmitter("rtcsyncreceivechannelopen", clientId));
                    // receiveChannel.addEventListener("message", this.linkToEventEmitter("rtcsyncreceivechannelmessage", clientId));
                    // receiveChannel.addEventListener("close", this.linkToEventEmitter("rtcsyncreceivechannelclose", clientId));
                    // receiveChannel.addEventListener("error", this.linkToEventEmitter("rtcsyncreceivechannelerror", clientId));
                    // receiveChannel.addEventListener("bufferedamountlow", this.linkToEventEmitter("rtcsyncreceivechannelbufferedamountlow", clientId));

                    break;
                case "audioChannel":
                    this.rtcPeers[clientId].audioReceiveChannel = receiveChannel;
                    this.emitEvent("audioreceivechannelcreated", { clientId, sourceEvent: receiveChannel });

                    // receiveChannel.addEventListener("open", this.linkToEventEmitter("rtcaudioreceivechannelopen", clientId));
                    // receiveChannel.addEventListener("message", this.linkToEventEmitter("rtcaudioreceivechannelmessage", clientId));
                    // receiveChannel.addEventListener("close", this.linkToEventEmitter("rtcaudioreceivechannelclose", clientId));
                    // receiveChannel.addEventListener("error", this.linkToEventEmitter("rtcaudioreceivechannelerror", clientId));
                    // receiveChannel.addEventListener("bufferedamountlow", this.linkToEventEmitter("rtcaudioreceivechannelbufferedamountlow", clientId));

                    break;
            }

            // const prefix = this.getChannelEventPrefix(channelName);

            // if (prefix) {
            //     receiveChannel.addEventListener("open", this.linkToEventEmitter(prefix + "receivechannelopen", clientId));
            //     receiveChannel.addEventListener("message", this.linkToEventEmitter("rtcreceivechannelmessage", clientId));
            //     receiveChannel.addEventListener("close", this.linkToEventEmitter("rtcreceivechannelclose", clientId));
            //     receiveChannel.addEventListener("error", this.linkToEventEmitter("rtcreceivechannelerror", clientId));
            //     receiveChannel.addEventListener("bufferedamountlow", this.linkToEventEmitter("rtcreceivechannelbufferedamountlow", clientId));
            // }

            // receiveChannel.addEventListener("open", this.linkToEventEmitter("rtcreceivechannelopen", clientId));
            // receiveChannel.addEventListener("message", this.linkToEventEmitter("rtcreceivechannelmessage", clientId));
            // receiveChannel.addEventListener("close", this.linkToEventEmitter("rtcreceivechannelclose", clientId));
            // receiveChannel.addEventListener("error", this.linkToEventEmitter("rtcreceivechannelerror", clientId));
            // receiveChannel.addEventListener("bufferedamountlow", this.linkToEventEmitter("rtcreceivechannelbufferedamountlow", clientId));
        });

        console.log("Here", pc);

        pc.addEventListener("iceconnectionstatechange", (event) => {
            console.log("iceconnectionstatechange", pc.iceConnectionState); // TODO: remove

            switch(pc.iceConnectionState) {
                case "new":
                    break;
                case "checking":
                    break;
                case "connected":
                    this.emitEvent("rtcconnected", { clientId, sourceEvent: event });
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
            // sendChannel: sendChannel,
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

        console.log("Connecting to", clientId);

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

        console.log("Closing connections for", clientId); // TODO: remove

        // Close channels
        peerObj.syncSendChannel.close();
        peerObj.syncReceiveChannel?.close();
        peerObj.audioSendChannel.close();
        peerObj.audioReceiveChannel?.close();
        // TODO: remove
        // peerObj.sendChannel.close();
        // peerObj.receiveChannel?.close();

        peerObj.peer.close();
    }

    /**
     * Disconnect from all clients
     */
    disconnectAll(): void {
        Object.keys(this.rtcPeers).forEach(clientId => this.disconnectRTC(clientId));
    }

    /**
     * Sends a message to the client
     * 
     * @param clientId The client id
     * @param message The message
     */
    // sendMessage(clientId: string, message: any) {
    //     // TODO: check if send channel is ready
    //     const sendChannel = this.getSendChannel(clientId, false);

    //     if (!sendChannel) {
    //         // TODO: handle error properly
    //         console.error(`Unable to send message to client '${clientId}'`);
    //         return;
    //     }

    //     sendChannel.send(message);
        
    // }

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

    // /**
    //  * Get the RTC data channel to the given client
    //  * 
    //  * @param clientId The client id
    //  * @param createIfMissing Create the peer connection if it is missing
    //  */
    // getSendChannel(clientId: string, createIfMissing = true): RTCDataChannel | null {
    //     const peerObject = this.getPeerObject(clientId, createIfMissing);
    //     if (!peerObject) return null;
    //     return peerObject.sendChannel;
    // }


    // -------------------------------------
    // --- EventEmitter Method Overrides ---
    // -------------------------------------

    // TODO: remove
    private linkToEventEmitter<K extends keyof PeerManagerEventMap>(eventName: K, clientId: string) {
        return (sourceEvent: any) => {
            const event: PeerManagerEvent<any> = { clientId, sourceEvent };
            this.emitEvent(eventName, event);
        }
    }

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
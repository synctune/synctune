import adapter from 'webrtc-adapter';
import Emittable from "@/events/Emittable";
import {} from "socket.io-client";
import RTCDataContainer from "@/rtc/RTCDataContainer";
import SignallingSocket from '@/socket/SignallingSocket';

interface PeerObject {
    peer: RTCPeerConnection;
    sendChannel: RTCDataChannel;
    receiveChannel?: RTCDataChannel;
}

interface PeersMap {
    [clientId: string]: PeerObject;
}

export interface PeerManagerEvent<T> {
    clientId: string;
    sourceEvent: T;
}

export interface PeerManagerEventMap {
    "rtcreceivechannelbufferedamountlow": PeerManagerEvent<Event>;
    "rtcreceivechannelclose": PeerManagerEvent<Event>;
    "rtcreceivechannelerror": PeerManagerEvent<RTCErrorEvent>;
    "rtcreceivechannelmessage": PeerManagerEvent<MessageEvent>;
    "rtcreceivechannelopen": PeerManagerEvent<Event>;
    "rtcconnected": PeerManagerEvent<Event>;
    "rtcdisconnected": PeerManagerEvent<Event>;
    "rtcfailed": PeerManagerEvent<Event>;
}

export default class PeerManager extends Emittable {
    private socket: SignallingSocket;
    private room: string;

    private rtcPeers: PeersMap;

    constructor(socket: SignallingSocket, room: string) {
        super();

        this.socket = socket;
        this.room = room;

        this.rtcPeers = {};
        this.listeners = {};

        this.setupSocketListeners(socket);
    }

    
    // -----------------------
    // --- Private Helpers ---
    // -----------------------

    /**
     * Sets up listeners to the given socket
     * 
     * @param socket The socket 
     */
    private setupSocketListeners(socket: SignallingSocket) {
        socket.on("signal-receive", async (room: string, senderId: string, data: RTCDataContainer) => {
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

        // Setup data channel
        const sendChannel = pc.createDataChannel("sendDataChannel");

        pc.addEventListener("datachannel", (event) => {
            const receiveChannel = event.channel;

            this.rtcPeers[clientId].receiveChannel = receiveChannel;

            receiveChannel.addEventListener("open", this.linkToEventEmitter("rtcreceivechannelopen", clientId));
            receiveChannel.addEventListener("message", this.linkToEventEmitter("rtcreceivechannelmessage", clientId));
            receiveChannel.addEventListener("close", this.linkToEventEmitter("rtcreceivechannelclose", clientId));
            receiveChannel.addEventListener("error", this.linkToEventEmitter("rtcreceivechannelerror", clientId));
            receiveChannel.addEventListener("bufferedamountlow", this.linkToEventEmitter("rtcreceivechannelbufferedamountlow", clientId));
        });

        pc.addEventListener("iceconnectionstatechange", (event) => {
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
            sendChannel: sendChannel,
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

        console.log("Closing connections for", clientId);

        // Close channels
        peerObj.sendChannel.close();
        peerObj.receiveChannel?.close();

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
    sendMessage(clientId: string, message: any) {
        // TODO: check if send channel is ready
        const sendChannel = this.getSendChannel(clientId, false);

        if (!sendChannel) {
            // TODO: handle error properly
            console.error(`Unable to send message to client '${clientId}'`);
            return;
        }

        sendChannel.send(message);
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
     * Get the RTC data channel to the given client
     * 
     * @param clientId The client id
     * @param createIfMissing Create the peer connection if it is missing
     */
    getSendChannel(clientId: string, createIfMissing = true): RTCDataChannel | null {
        const peerObject = this.getPeerObject(clientId, createIfMissing);
        if (!peerObject) return null;
        return peerObject.sendChannel;
    }


    // -------------------------------------
    // --- EventEmitter Method Overrides ---
    // -------------------------------------

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
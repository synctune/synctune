import adapter from 'webrtc-adapter';
import {} from "socket.io-client";
import { SignalEvents, EmissionEvents } from "../constants/SocketEvents";
import RTCDataContainer from "./RTCDataContainer";

interface PeerObject {
    peer: RTCPeerConnection;
    sendChannel: RTCDataChannel;
}

interface PeersMap {
    [clientId: string]: PeerObject;
}

interface RegisteredListeners {
    [eventName: string]: Function[];
}

// export enum PeerManagerEvents {
//     RECEIVE_CHANNEL_OPEN = "receivechannelbufferedamountlow",
//     RECEIVE_CHANNEL_MESSAGE = "receive-channel-message",
//     RECEIVE_CHANNEL_CLOSE = "receive-channel-close",
//     RECEIVE_CHANNEL_ERROR = "receive-channel-error",
//     RECEIVE_CHANNEL_BUFFERED_AMOUNT_LOW = "receive-channel-buffered-amount-low",

//     RTC_CONNECTED = "rtc-connection-successful",
//     RTC_DISCONNECTED = "rtc-disconnected",
//     RTC_FAILED = "rtc-failed",
// };

interface PeerManagerEventMap {
    "receivechannelbufferedamountlow": Event;
    "receivechannelclose": Event;
    "receivechannelerror": RTCErrorEvent;
    "receivechannelmessage": MessageEvent;
    "receivechannelopen": Event;
    "rtcconnected": Event;
    "rtcdisconnected": Event;
    "rtcfailed": Event;
}

export default class PeerManager {
    private socket: SocketIOClient.Socket;
    private room: string;

    private rtcPeers: PeersMap;
    private listeners: RegisteredListeners;

    constructor(socket: SocketIOClient.Socket, room: string) {
        this.socket = socket;
        this.room = room;

        this.rtcPeers = {};
        this.listeners = {};

        this.setupSocketListeners();
    }

    private setupSocketListeners() {
        this.socket.on(SignalEvents.SIGNAL_RECEIVE, async (room: string, senderId: string, data: RTCDataContainer) => {
            console.log("Received signal from", senderId, data); // TODO: remove

            // TODO: credit this: https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
            try {
                const { description, candidate } = data;

                // Get the peer connection with the sender, creating it if need be
                const pc = this.getPeerConnection(senderId, true);

                // If a description was received
                if (description) {
                    switch(description.type) {
                        // If an offer is received then reply with an answer
                        case "offer":
                            await pc.setRemoteDescription(description);

                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);

                            console.log("Sending response signal to", senderId, { description: answer }); // TODO: remove

                            // Send back the answer
                            this.socket.emit(EmissionEvents.SIGNAL_SEND, this.room, senderId, { description: answer });

                            break;
                        // Just update remote description with answer 
                        case "answer":
                            await pc.setRemoteDescription(description);

                            break;
                        default:
                            // TODO: handle error properly
                            console.log('Unsupported SDP type.');
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

    private emitEvent<K extends keyof PeerManagerEventMap>(eventName: K, clientId: string, event: PeerManagerEventMap[K]) {
        // No events register for this event, do nothing
        if (!this.listeners[eventName]) {
            return;
        }

        const listeners = this.listeners[eventName];
        listeners.forEach(listener => listener(clientId, event));
    }

    private linkToEventEmitter<K extends keyof PeerManagerEventMap>(eventName: K, clientId: string) {
        return (event: any) => {
            this.emitEvent(eventName, clientId, event);
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
            console.log("Sending ICE candidate to", clientId, candidate); // TODO: remove
            this.socket.emit(EmissionEvents.SIGNAL_SEND, this.room, clientId, { candidate });
        });

        // Setup data channel
        const sendChannel = pc.createDataChannel("sendDataChannel");

        pc.addEventListener("datachannel", (event) => {
            console.log("Data channel", event);

            const receiveChannel = event.channel
            
            // receiveChannel.onmessage = (event) => {
            //     console.log("PM: Message from", clientId, event.data);
            // };

            // receiveChannel.addEventListener("message", (event) => {
            //     console.log("PM: Message from", clientId, event.data);
            // });

            receiveChannel.addEventListener("open", this.linkToEventEmitter("receivechannelopen", clientId));
            receiveChannel.addEventListener("message", this.linkToEventEmitter("receivechannelmessage", clientId));
            receiveChannel.addEventListener("close", this.linkToEventEmitter("receivechannelclose", clientId));
            receiveChannel.addEventListener("error", this.linkToEventEmitter("receivechannelerror", clientId));
            receiveChannel.addEventListener("bufferedamountlow", this.linkToEventEmitter("receivechannelbufferedamountlow", clientId));
        });

        pc.addEventListener("iceconnectionstatechange", (event) => {
            console.log("Connection state change:", pc.iceConnectionState); // TODO: remove

            switch(pc.iceConnectionState) {
                case "new":
                    break;
                case "checking":
                    break;
                case "connected":
                    this.emitEvent("rtcconnected", clientId, event);
                    break;
                case "completed":
                    break;
                case "disconnected":
                    // Cleanup event listeners
                    const peerObj = this.getPeerObject(clientId, false);
                    peerObj.peer.onicecandidate = null;
                    peerObj.peer.onconnectionstatechange = null;

                    // Remove peer connection from the peer objects
                    delete this.rtcPeers[clientId];

                    console.log("Disconnected from", clientId); // TODO: remove

                    this.emitEvent("rtcdisconnected", clientId, event);
                    break;
                case "failed":
                    this.emitEvent("rtcfailed", clientId, event);
                    break;
                case "closed":
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

    /**
     * Initializes an RTC connection process with a client in the room
     * 
     * @param clientId The target client id
     */
    async connectRTC(clientId: string) {
        // Get peer connection, creating it if need be
        const pc = this.getPeerConnection(clientId, true);

        // Create offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log("Initiating to", clientId, { description: offer }); // TODO: remove

        // Send offer to client
        this.socket.emit(EmissionEvents.SIGNAL_SEND, this.room, clientId, { description: offer });
    }

    /**
     * Closes an RTC connection with a client in the room
     * 
     * @param clientId The target client id
     */
    disconnectRTC(clientId: string): void {
        const ps = this.getPeerConnection(clientId, false);
        ps?.close();
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
        return peerObject?.peer; // ? is called "optional-chaining"
    }

    /**
     * Get the RTC data channel to the given client
     * 
     * @param clientId The client id
     * @param createIfMissing Create the peer connection if it is missing
     */
    getSendChannel(clientId: string, createIfMissing = true): RTCDataChannel | null {
        const peerObject = this.getPeerObject(clientId, createIfMissing);
        return peerObject?.sendChannel;
    }
    
    addEventListener<K extends keyof PeerManagerEventMap>(event: K, listener: (clientId: string, e: PeerManagerEventMap[K]) => any) {
        // No listeners on event yet, add the first one
        if (!this.listeners[event]) {
            this.listeners[event] = [listener];
            return;
        }

        this.listeners[event].push(listener);
    }

    removeEventListener<K extends keyof PeerManagerEventMap>(event: K, listener: (clientId: string, e: PeerManagerEventMap[K]) => any) {
        // No listeners on event, so do nothing
        if (!this.listeners[event]) {
            return;
        }

        // Attempt to find listener
        const idx = this.listeners[event].findIndex((list) => list === listener);

        // Listener was found, remove it
        if (idx >= 0) {
            this.listeners[event].splice(idx, 1);
        }
    }
}
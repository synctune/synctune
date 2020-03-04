<template>
    <div>
        <h1>WebRTC Connection via Signalling Server</h1>

        <div>
            <input 
                type="text" 
                placeholder="Room name" 
                v-model="roomName"
            >
            <button 
                @click="createRoom"
                :disabled="signallingConnected"
            >
                Create Room
            </button>
            <button 
                @click="joinRoom"
                :disabled="signallingConnected"
            >
                Join Room
            </button>

            <button
                @click="leaveRoom"
                :disabled="!signallingConnected"
            >
                Leave Room
            </button>
        </div>

        <!-- For quick spacing purposes, don't worry! -->
        <br>

        <div>
            <div>Signalling Server Connected: {{ signallingConnected }}</div>
            <div>
                Signalling Server Clients:
                <ul>
                    <li 
                        :key="`signalling-client-${clientId}`"
                        v-for="clientId in signallingClientIds"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>
            <br>
            <div>
                WebRTC Connections:
                <ul>
                    <li 
                        :key="`rtc-peer-${clientId}`"
                        v-for="(pc, clientId) in rtcPeers"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>

            <div>
                <button
                    @click="sayHi"
                >
                    Say Hi!
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from "socket.io-client";
import { SignalEvents, EmissionEvents } from "../../constants/SocketEvents";
import RTCDataContainer from '../../../../signaling-server/src/io/RTCDataContainer';

interface Data {
    roomName: string;
    signallingConnected: boolean;
    signallingClientIds: string[];
    socket: SocketIOClient.Socket;
    
    rtcConnected: boolean;
    rtcPeers: {
        [clientId: string]: {
            peer: RTCPeerConnection;
            sendChannel: RTCDataChannel;
        };
    };
}

interface Methods {
    createRoom: () => void;
    joinRoom: () => void;
    leaveRoom: () => void;
    setupGeneralListeners: (socket: SocketIOClient.Socket) => void;
    getPeerConnection: (socket: SocketIOClient.Socket, room: string, clientId: string) => RTCPeerConnection;
    getSendChannel: (socket: SocketIOClient.Socket, room: string, clientId: string) => RTCDataChannel;
    createPeerConnection: (socket: SocketIOClient.Socket, room: string, clientId: string) => void;
}

export default Vue.extend({
    data() {
        return {
            roomName: "test",
            signallingConnected: false,
            signallingClientIds: [],
            socket: null,

            rtcConnected: false,
            rtcPeers: {},
        }
    },
    mounted() {
        this.socket = io("localhost:5000");

        console.log(this);
    },
    methods: {
        sayHi() {
            const { roomName, socket, rtcPeers }: Data = this;
            const { getSendChannel }: Methods = this;

            const sendChannel = getSendChannel(socket, roomName, Object.keys(rtcPeers)[0]);

            sendChannel.send("Hello from the other side!");
        },
        getPeerConnection(socket: SocketIOClient.Socket, room: string, clientId: string) {
            const { rtcPeers }: Data = this;
            const { createPeerConnection }: Methods = this;

            // Creat the peer connection if it does already not exist
            if (!rtcPeers[clientId]) {
                createPeerConnection(socket, room, clientId);
            }

            return rtcPeers[clientId].peer;
        },
        getSendChannel(socket: SocketIOClient.Socket, room: string, clientId: string) {
            const { rtcPeers }: Data = this;
            const { createPeerConnection }: Methods = this;

            // Creat the peer connection if it does already not exist
            if (!rtcPeers[clientId]) {
                createPeerConnection(socket, room, clientId);
            }

            return rtcPeers[clientId].sendChannel;
        },
        createPeerConnection(socket: SocketIOClient.Socket, room: string, clientId: string) {
            const { rtcPeers }: Data = this;

            const pc = new RTCPeerConnection();

            console.log("Creating peer connection");

            pc.onicecandidate = ({ candidate }) => {
                console.log("Sending ICE candidate to", clientId, candidate);
                socket.emit(EmissionEvents.SIGNAL_SEND, room, clientId, { candidate });
            };

            // Setup data send channel
            const sendChannel = pc.createDataChannel("sendDataChannel");

            pc.ondatachannel = (event) => {
                const receiveChannel = event.channel;
                receiveChannel.onmessage = (event) => {
                    console.log("Message from", clientId, event.data);
                };
            };

            rtcPeers[clientId] = {
                peer: pc,
                sendChannel
            };
        },
        createRoom() {
            const { roomName, socket }: Data = this;
            const { setupGeneralListeners }: Methods = this;

            console.log("Creating room", roomName);

            socket.emit(EmissionEvents.ROOM_CREATE, roomName);

            setupGeneralListeners(socket);

            socket.on(SignalEvents.ERROR, (err: any) => {
                console.log("Server error:", err);
                this.signallingConnected = false;
            });
            socket.on(SignalEvents.ROOM_EXISTS, (message: string) => {
                console.log("Server:", message);
                this.signallingConnected = false;
            });
            socket.on(SignalEvents.ROOM_CREATED, (message: string) => {
                console.log("Server:", message);
                this.signallingConnected = true;
                this.signallingClientIds = [];

                const { signallingClientIds }: Data = this;
                signallingClientIds.push(`${socket.id} (me)`);
            });

            socket.on(SignalEvents.CLIENT_JOINED, async (room: string, clientId: string) => {
                console.log("Client joined", clientId);
                // Setup peer connection with newly joined client
                const { getPeerConnection }: Methods = this;
                const pc = getPeerConnection(socket, room, clientId);

                // Initiate by creating offer
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                console.log("Initiating to", clientId, { description: offer });
                socket.emit(EmissionEvents.SIGNAL_SEND, room, clientId, { description: offer });
            });
        },
        joinRoom() {
            const { roomName, socket }: Data = this;
            const { setupGeneralListeners }: Methods = this;

            console.log("Joining room", roomName);

            socket.emit(EmissionEvents.ROOM_JOIN, roomName);

            setupGeneralListeners(socket);

            socket.on(SignalEvents.ERROR, (err: any) => {
                console.log("Server error:", err);
                this.signallingConnected = false;
            });

            socket.on(SignalEvents.ROOM_NOT_EXISTS, (message: string) => {
                console.log("Server:", message);
                this.signallingConnected = false;
            });

            socket.on(SignalEvents.ROOM_JOINED, (room: string, clients: string[]) => {
                console.log(`Room '${room}' successfully joined`);
                this.signallingConnected = true;
                this.signallingClientIds = [];

                const { signallingClientIds }: Data = this;
                signallingClientIds.push(...clients);
                signallingClientIds.push(`${socket.id} (me)`);

                // Don't care about any join events
                // We wait for the room owner to begin communication
            });
        },
        leaveRoom() {
            const { roomName, socket }: Data = this;

            socket.emit(EmissionEvents.ROOM_LEAVE, roomName);
        },
        setupGeneralListeners(socket: SocketIOClient.Socket) {
            socket.on(SignalEvents.ROOM_LEFT, (room: string, kicked: boolean) => {
                console.log(`Left room '${room}'. Kicked: ${kicked}`);
                this.signallingConnected = false;
                this.signallingClientIds = [];
            });

            socket.on(SignalEvents.CLIENT_JOINED, (room: string, clientId: string) => {
                console.log(`Client '${clientId}' joined room '${room}'`);

                const { signallingClientIds }: Data = this;
                signallingClientIds.push(clientId);
            });

            socket.on(SignalEvents.CLIENT_LEFT, (room: string, clientId: string) => {
                console.log(`Client '${clientId}' left room '${room}'`);

                const { signallingClientIds }: Data = this;
                const idx = signallingClientIds.indexOf(clientId);
                if (idx > -1) {
                    signallingClientIds.splice(idx, 1);
                }
            });

            socket.on(SignalEvents.SIGNAL_RECEIVE, async (room: string, senderId: string, data: RTCDataContainer) => {
                console.log("Received signal from", senderId, data);

                // TODO: credit this: https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
                try {
                    const { getPeerConnection }: Methods = this;
                    const { description, candidate } = data;

                    // Get the peer connection, creating it if need be
                    const pc = getPeerConnection(socket, room, senderId);

                    if (description) {
                        // If an offer is received then reply with an answer
                        if (description.type === "offer") {
                            await pc.setRemoteDescription(description);

                            // TODO: setup data channel???

                            const answer = await pc.createAnswer();
                            await pc.setLocalDescription(answer);
                            console.log("Sending response signal to", senderId, { description: answer })
                            socket.emit(EmissionEvents.SIGNAL_SEND, room, senderId, { description: answer });

                        } else if (description.type === "answer") {
                            await pc.setRemoteDescription(description);
                        }  else {
                            console.log('Unsupported SDP type.');
                        }

                    } else if (candidate) {
                        await pc.addIceCandidate(candidate);
                    }
                } catch(err) {
                    console.log(err);
                }
            });
        }
    }
});
</script>

<style>

</style>
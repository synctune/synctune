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
                        v-for="(clientId) in rtcPeers"
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
                <input 
                    type="text" 
                    placeholder="Send to..." 
                    v-model="sendClientId"
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import adapter from 'webrtc-adapter';
import io from "socket.io-client";
import { SignalEvents, EmissionEvents } from "../../constants/SocketEvents";
import RTCDataContainer from '../../rtc/RTCDataContainer';
import PeerManager from "../../rtc/PeerManager";
import RoomManager from "../../rtc/RoomManager";
import SignallingSocket from "../../socket/SignallingSocket";

interface Data {
    roomName: string;
    signallingConnected: boolean;
    signallingClientIds: string[];
    socket: SignallingSocket;
    
    sendClientId: string;
    // peerManager: PeerManager;
    rtcConnected: boolean;

    roomManager: RoomManager;

    rtcPeers: string[];
}

interface Methods {
    createRoom: () => void;
    joinRoom: () => void;
    leaveRoom: () => void;
    // setupPeerManager(socket: SignallingSocket, roomName: string): void;
    setupGeneralRTCListeners(peerManager: PeerManager): void;
    setupGeneralSocketListeners(socket: SignallingSocket): void;
}

export default Vue.extend({
    data() {
        return {
            roomName: "test",
            signallingConnected: false,
            signallingClientIds: [],
            socket: null,

            sendClientId: "",

            rtcConnected: false,
            rtcPeers: [],

            roomManager: null,

            // peerManager: null
        }
    },
    mounted() {
        // TODO: don't hardcode signalling server address
        this.socket = io("localhost:5000");

        this.roomManager = new RoomManager(this.socket);

        console.log(this);
    },
    methods: {
        sayHi() {
            const { roomManager, sendClientId }: Data = this;
            const peerManager = roomManager.peerManager as PeerManager; // TODO: why does this do that?
            peerManager.sendMessage(sendClientId.trim(), "Hello from the other side!");

            // const { peerManager, sendClientId }: Data = this;
            // peerManager.sendMessage(sendClientId, "Hello from the other side!");
        },
        createRoom() {
            const { roomManager, roomName }: Data = this;
            const { setupGeneralSocketListeners }: Methods = this;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            roomManager.createRoom(roomName);

            signallingSocket.on("error", (message) => {
                console.log("Server error:", message);
                this.signallingConnected = false;
            });

            signallingSocket.on("room-exists", (room) => {
                this.signallingConnected = false;
            });

            signallingSocket.on("room-created", (room) => {
                this.signallingConnected = true;
                this.signallingClientIds = [];

                const { signallingClientIds, socket }: Data = this;
                signallingClientIds.push(`${socket.id} (me)`);
            });

            setupGeneralSocketListeners(this.socket);

            // const { roomName, socket }: Data = this;
            // const { setupGeneralSocketListeners, setupPeerManager }: Methods = this;

            // console.log("Creating room", roomName);

            // socket.emit(EmissionEvents.ROOM_CREATE, roomName);

            // setupGeneralSocketListeners(socket);
            // setupPeerManager(socket, roomName);

            // socket.on(SignalEvents.ERROR, (err: any) => {
            //     console.log("Server error:", err);
            //     this.signallingConnected = false;
            // });
            // socket.on(SignalEvents.ROOM_EXISTS, (message: string) => {
            //     console.log("Server:", message);
            //     this.signallingConnected = false;
            // });
            // socket.on(SignalEvents.ROOM_CREATED, (message: string) => {
            //     console.log("Server:", message);
            //     this.signallingConnected = true;
            //     this.signallingClientIds = [];

            //     const { signallingClientIds }: Data = this;
            //     signallingClientIds.push(`${socket.id} (me)`);
            // });

            // socket.on(SignalEvents.CLIENT_JOINED, async (room: string, clientId: string) => {
            //     const { peerManager }: Data = this;

            //     console.log("Client joined", clientId);

            //     peerManager.connectRTC(clientId);
            // });
        },
        joinRoom() {
            const { roomManager, roomName }: Data = this;
            const { setupGeneralSocketListeners }: Methods = this;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            roomManager.joinRoom(roomName);

            signallingSocket.on("error", (message) => {
                console.log("Server error:", message);
                this.signallingConnected = false;
            });

            signallingSocket.on("room-not-exists", (room) => {
                this.signallingConnected = false;
            });

            signallingSocket.on("room-joined", (room, clients) => {
                this.signallingConnected = true;
                this.signallingClientIds = [];

                const { signallingClientIds, socket }: Data = this;
                signallingClientIds.push(...clients);
                signallingClientIds.push(`${socket.id} (me)`);
            });

            
            setupGeneralSocketListeners(this.socket);

            // const { roomName, socket }: Data = this;
            // const { setupGeneralSocketListeners, setupPeerManager }: Methods = this;

            // console.log("Joining room", roomName);

            // socket.emit(EmissionEvents.ROOM_JOIN, roomName);

            // setupGeneralSocketListeners(socket);
            // setupPeerManager(socket, roomName);

            // socket.on(SignalEvents.ERROR, (err: any) => {
            //     console.log("Server error:", err);
            //     this.signallingConnected = false;
            // });

            // socket.on(SignalEvents.ROOM_NOT_EXISTS, (message: string) => {
            //     console.log("Server:", message);
            //     this.signallingConnected = false;
            // });

            // socket.on(SignalEvents.ROOM_JOINED, (room: string, clients: string[]) => {
            //     console.log(`Room '${room}' successfully joined`);
            //     this.signallingConnected = true;
            //     this.signallingClientIds = [];

            //     const { signallingClientIds }: Data = this;
            //     signallingClientIds.push(...clients);
            //     signallingClientIds.push(`${socket.id} (me)`);

            //     // Don't care about any join events
            //     // We wait for the room owner to begin communication
            // });

        },
        leaveRoom() {
            const { roomManager, roomName }: Data = this;

            roomManager.leaveRoom();

            // const { roomName, socket, peerManager }: Data = this;

            // peerManager.disconnectAll();

            // socket.emit(EmissionEvents.ROOM_LEAVE, roomName);
        },
        // setupPeerManager(socket: SignallingSocket, roomName: string) {
        //     this.peerManager = new PeerManager(socket, roomName);
        //     const { peerManager, rtcPeers }: Data = this;
        //     peerManager.addEventListener("rtcconnected", ({ clientId, sourceEvent }) => {
        //         console.log(`RTC: Client '${clientId}' connected`);
        //         rtcPeers.push(clientId);
        //         this.rtcConnected = true;
        //     });

        //     peerManager.addEventListener("rtcdisconnected", ({ clientId, sourceEvent }) => {
        //         console.log(`RTC: Client '${clientId}' disconnected`);
                
        //         const idx = rtcPeers.indexOf(clientId);
        //         if (idx >= 0) Vue.delete(this.rtcPeers, idx);
        //         this.rtcConnected = false;
        //     });

        //     peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
        //         console.log("Message from", clientId, sourceEvent.data);
        //     });
        // },
        setupGeneralRTCListeners(peerManager: PeerManager) {
            const { rtcPeers }: Data = this;
            peerManager.addEventListener("rtcconnected", ({ clientId, sourceEvent }) => {
                console.log(`RTC: Client '${clientId}' connected`);
                rtcPeers.push(clientId);
                this.rtcConnected = true;
            });

            peerManager.addEventListener("rtcdisconnected", ({ clientId, sourceEvent }) => {
                console.log(`RTC: Client '${clientId}' disconnected`);
                
                const idx = rtcPeers.indexOf(clientId);
                if (idx >= 0) Vue.delete(this.rtcPeers, idx);
                this.rtcConnected = false;
            });

            peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
                console.log("Message from", clientId, sourceEvent.data);
            });
        },
        setupGeneralSocketListeners(socket: SignallingSocket) {
            console.log("setting up general sockets");

            const { roomManager, roomName }: Data = this;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            signallingSocket.on("room-left", (room, kicked) => {
                console.log(`> Left room '${room}'. Kicked: ${kicked}`);
                this.signallingConnected = false;
                this.signallingClientIds = [];
            });

            signallingSocket.on("client-joined", (room, clientId) => {
                console.log(`> Client '${clientId}' joined room '${room}'`);

                const { signallingClientIds }: Data = this;
                signallingClientIds.push(clientId);
            });

            signallingSocket.on("client-left", (room, clientId) => {
                console.log(`> Client '${clientId}' left room '${room}'`);

                const { signallingClientIds }: Data = this;
                const idx = signallingClientIds.indexOf(clientId);
                if (idx >= 0) Vue.delete(this.signallingClientIds, idx);
            });

            roomManager.addEventListener("peermanagercreated", () => {
                const { setupGeneralRTCListeners }: Methods = this;
                setupGeneralRTCListeners(roomManager.peerManager);
            });

            // socket.on(SignalEvents.ROOM_LEFT, (room: string, kicked: boolean) => {
            //     console.log(`Left room '${room}'. Kicked: ${kicked}`);
            //     this.signallingConnected = false;
            //     this.signallingClientIds = [];
            // });

            // socket.on(SignalEvents.CLIENT_JOINED, (room: string, clientId: string) => {
            //     console.log(`Client '${clientId}' joined room '${room}'`);

            //     const { signallingClientIds }: Data = this;
            //     signallingClientIds.push(clientId);
            // });

            // socket.on(SignalEvents.CLIENT_LEFT, (room: string, clientId: string) => {
            //     console.log(`Client '${clientId}' left room '${room}'`);

            //     const { signallingClientIds }: Data = this;
            //     const idx = signallingClientIds.indexOf(clientId);
            //     if (idx >= 0) Vue.delete(this.signallingClientIds, idx);
            // });
        }
    }
});
</script>

<style>

</style>
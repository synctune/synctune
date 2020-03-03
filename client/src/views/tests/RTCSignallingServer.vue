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
                        {{clientId}}
                    </li>
                </ul>
            </div>
            <br>
            <div>
                WebRTC Connections:
                <ul>
                    <li 
                        :key="`rtc-peer-${rtcPeer}`"
                        v-for="rtcPeer in rtcPeers"
                    >
                        {{rtcPeer}}
                    </li>
                </ul>
            </div>

            <div>
                <button
                :disabled="!rtcConnected"
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

interface Data {
    roomName: string;
    signallingConnected: boolean;
    signallingClientIds: string[];
    socket: SocketIOClient.Socket;
    
    rtcConnected: boolean;
    rtcPeers: string[];
}

interface Methods {
    createRoom: () => void;
    joinRoom: () => void;
    leaveRoom: () => void;
    setupGeneralListeners: (socket: SocketIOClient.Socket) => void;
}

export default Vue.extend({
    data() {
        return {
            roomName: "test",
            signallingConnected: false,
            signallingClientIds: [],
            socket: null,

            rtcConnected: false,
            rtcPeers: [],
        }
    },
    mounted() {
        this.socket = io("localhost:5000");
    },
    methods: {
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

            socket.on(SignalEvents.CLIENT_JOINED, (room: string, clientId: string) => {
                console.log("TODO: setup RTC connection");
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
        }
    }
});
</script>

<style>

</style>
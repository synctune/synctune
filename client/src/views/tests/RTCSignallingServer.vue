<template>
    <div>
        <input 
            type="text" 
            placeholder="Room name" 
            v-model="roomName"
        >
        <button 
            @click="createRoom"
            :disabled="connected"
        >
            Create Room
        </button>
        <button 
            @click="joinRoom"
            :disabled="connected"
        >
            Join Room
        </button>

        <button
            @click="leaveRoom"
            :disabled="!connected"
        >
            Leave Room
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from "socket.io-client";
import { SignalEvents, EmissionEvents } from "../../constants/SocketEvents";

interface Data {
    roomName: string;
    connected: boolean;
    socket: SocketIOClient.Socket;
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
            connected: false,
            socket: null
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

            socket.on(SignalEvents.ERROR, (err: any) => {
                console.log("Server error:", err);
                this.connected = false;
            });
            socket.on(SignalEvents.ROOM_EXISTS, (message: string) => {
                console.log("Server:", message);
                this.connected = false;
            });
            socket.on(SignalEvents.ROOM_CREATED, (message: string) => {
                console.log("Server:", message);
                this.connected = true;
            });

            setupGeneralListeners(socket);
        },
        joinRoom() {
            const { roomName, socket }: Data = this;
            const { setupGeneralListeners }: Methods = this;

            console.log("Joining room", roomName);

            socket.emit(EmissionEvents.ROOM_JOIN, roomName);

            socket.on(SignalEvents.ERROR, (err: any) => {
                console.log("Server error:", err);
                this.connected = false;
            });
            socket.on(SignalEvents.ROOM_NOT_EXISTS, (message: string) => {
                console.log("Server:", message);
                this.connected = false;
            });
            socket.on(SignalEvents.ROOM_JOINED, (room: string) => {
                console.log(`Room '${room}' successfully joined`);
                this.connected = true;

                // Don't care about any join events
                // We wait for the room owner to begin communication
            });

            setupGeneralListeners(socket);
        },
        leaveRoom() {
            const { roomName, socket }: Data = this;

            socket.emit(EmissionEvents.ROOM_LEAVE, roomName);
        },
        setupGeneralListeners(socket: SocketIOClient.Socket) {
            socket.on(SignalEvents.ROOM_LEFT, (room: string, kicked: boolean) => {
                console.log(`Left room '${room}'. Kicked: ${kicked}`);
                this.connected = false;
            });

            socket.on(SignalEvents.CLIENT_JOINED, (room: string, clientId: string) => {
                console.log(`Client '${clientId}' joined room '${room}'`);
            });

            socket.on(SignalEvents.CLIENT_LEFT, (room: string, clientId: string) => {
                console.log(`Client '${clientId}' left room '${room}'`);
            });
        }
    }
});
</script>

<style>

</style>
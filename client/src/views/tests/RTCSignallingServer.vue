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
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import io from "socket.io-client";

interface Data {
    roomName: string;
    connected: boolean;
    socket: SocketIOClient.Socket;
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

            socket.emit("room-create", roomName);
            socket.on("error", (err: any) => {
                console.log("Server error:", err);
                this.connected = false;
            });
            socket.on("room-exists", (message: string) => {
                console.log("Server:", message);
                this.connected = false;
            });
            socket.on("room-created", (message: string) => {
                console.log("Server:", message);
                this.connected = true;
            });
            socket.on("client-joined", (otherId: string) => {
                console.log(`'${otherId}' joined room`);

                // TODO: initiate RTC signalling process
            });
        },
        joinRoom() {
            const { roomName, socket }: Data = this;

            console.log("Joining room", roomName);

            socket.emit("room-join", roomName);
            socket.on("error", (err: any) => {
                console.log("Server error:", err);
                this.connected = false;
            });
            socket.on("room-not-exists", (message: string) => {
                console.log("Server:", message);
                this.connected = false;
            });
            socket.on("room-joined", (room: string) => {
                console.log(`Room '${room}' successfully joined`);
                // Don't care about any join events
                // We wait for the room owner to begin communication
            });
        }
    }
});
</script>

<style>

</style>
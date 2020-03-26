<template>
    <div>
        <!-- <h1>WebRTC Connection via Signalling Server</h1>

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
        </div> -->
    </div>
</template>

<script lang="ts">
import Vue from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import adapter from "webrtc-adapter";
// import io from "socket.io-client";
import PeerManager from "../../rtc/PeerManager";
import RoomManager from "../../rtc/RoomManager";
import SignallingSocket from "../../socket/SignallingSocket";
import KEYS from "../../keys";

interface Data {
    roomName: string;
    signallingConnected: boolean;
    signallingClientIds: string[];
    socket: SignallingSocket;

    sendClientId: string;
    rtcConnected: boolean;

    roomManager: RoomManager;

    rtcPeers: string[];
}

interface Methods {
    createRoom: () => void;
    joinRoom: () => void;
    leaveRoom: () => void;
    setupGeneralRTCListeners(peerManager: PeerManager): void;
    setupGeneralSocketListeners(socket: SignallingSocket): void;
}

export default Vue.extend({
    // data() {
    //     return {
    //         roomName: "test",
    //         signallingConnected: false,
    //         signallingClientIds: [],
    //         socket: null,
    //         sendClientId: "",
    //         rtcConnected: false,
    //         rtcPeers: [],
    //         roomManager: null,
    //     }
    // },
    // mounted() {
    //     // this.socket = io(`/`, { path: KEYS.ROOM_SERVER_SOCKET_IO_PATH });
    //     // this.roomManager = new RoomManager(this.socket);
    //     const roomManager = new RoomManager();
    //     this.roomManager = roomManager;
    //     this.socket = roomManager.signallingSocket as SignallingSocket;
    // },
    // methods: {
    //     sayHi() {
    //         const { roomManager, sendClientId }: Data = this;
    //         const peerManager = roomManager.peerManager as PeerManager; // TODO: why does this do that? Answer: some Vetur thing probably
    //         peerManager.sendMessage(sendClientId.trim(), "Hello from the other side!");
    //     },
    //     createRoom() {
    //         const { roomManager, roomName }: Data = this;
    //         const { setupGeneralSocketListeners }: Methods = this;
    //         const signallingSocket = roomManager.signallingSocket as SignallingSocket;
    //         roomManager.createRoom(roomName);
    //         signallingSocket.on("error", (message) => {
    //             console.log("Server error:", message);
    //             this.signallingConnected = false;
    //         });
    //         signallingSocket.on("room-exists", (room) => {
    //             this.signallingConnected = false;
    //         });
    //         signallingSocket.on("room-created", (room) => {
    //             this.signallingConnected = true;
    //             this.signallingClientIds = [];
    //             const { signallingClientIds, socket }: Data = this;
    //             signallingClientIds.push(`${socket.id} (me)`);
    //         });
    //         setupGeneralSocketListeners(this.socket);
    //     },
    //     joinRoom() {
    //         const { roomManager, roomName }: Data = this;
    //         const { setupGeneralSocketListeners }: Methods = this;
    //         const signallingSocket = roomManager.signallingSocket as SignallingSocket;
    //         roomManager.joinRoom(roomName);
    //         signallingSocket.on("error", (message) => {
    //             console.log("Server error:", message);
    //             this.signallingConnected = false;
    //         });
    //         signallingSocket.on("room-not-exists", (room) => {
    //             this.signallingConnected = false;
    //         });
    //         signallingSocket.on("room-joined", (room, ownerId, clients) => {
    //             this.signallingConnected = true;
    //             this.signallingClientIds = [];
    //             const { signallingClientIds, socket }: Data = this;
    //             signallingClientIds.push(...clients);
    //             signallingClientIds.push(`${socket.id} (me)`);
    //         });
    //         setupGeneralSocketListeners(this.socket);
    //     },
    //     leaveRoom() {
    //         const { roomManager }: Data = this;
    //         roomManager.leaveRoom();
    //     },
    //     setupGeneralRTCListeners(peerManager: PeerManager) {
    //         const { rtcPeers }: Data = this;
    //         peerManager.addEventListener("rtcconnected", ({ clientId, sourceEvent }) => {
    //             console.log(`RTC: Client '${clientId}' connected`);
    //             rtcPeers.push(clientId);
    //             this.rtcConnected = true;
    //         });
    //         peerManager.addEventListener("rtcdisconnected", ({ clientId, sourceEvent }) => {
    //             console.log(`RTC: Client '${clientId}' disconnected`);
    //             const idx = rtcPeers.indexOf(clientId);
    //             if (idx >= 0) Vue.delete(this.rtcPeers, idx);
    //             this.rtcConnected = false;
    //         });
    //         peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
    //             console.log("Message from", clientId, sourceEvent.data);
    //         });
    //     },
    //     setupGeneralSocketListeners(socket: SignallingSocket) {
    //         console.log("setting up general sockets");
    //         const { roomManager, roomName }: Data = this;
    //         const signallingSocket = roomManager.signallingSocket as SignallingSocket;
    //         signallingSocket.on("room-left", (room, kicked) => {
    //             console.log(`> Left room '${room}'. Kicked: ${kicked}`);
    //             this.signallingConnected = false;
    //             this.signallingClientIds = [];
    //         });
    //         signallingSocket.on("client-joined", (room, clientId) => {
    //             console.log(`> Client '${clientId}' joined room '${room}'`);
    //             const { signallingClientIds }: Data = this;
    //             signallingClientIds.push(clientId);
    //         });
    //         signallingSocket.on("client-left", (room, clientId) => {
    //             console.log(`> Client '${clientId}' left room '${room}'`);
    //             const { signallingClientIds }: Data = this;
    //             const idx = signallingClientIds.indexOf(clientId);
    //             if (idx >= 0) Vue.delete(this.signallingClientIds, idx);
    //         });
    //         roomManager.addEventListener("peermanagercreated", () => {
    //             const { setupGeneralRTCListeners }: Methods = this;
    //             setupGeneralRTCListeners(roomManager.peerManager);
    //         });
    //     }
    // }
});
</script>

<style></style>

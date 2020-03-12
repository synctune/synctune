<template>
    <div id="Room">
        <button
            @click="leaveRoom"
            :disabled="!isConnected"
        >
            Leave Room
        </button>

        <div>
            <div>RoomManager connected: {{ isConnected }}</div>
            <div>Is Room Owner: {{ isOwner }}</div>
            <div>ID: {{ id }}</div>

            <br>

            <div>
                Signalling Server Clients:
                <ul>
                    <li 
                        :key="`signalling-client-${clientId}`"
                        v-for="clientId in connectedSocketClients"
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
                        v-for="(clientId) in connectedRTCClients"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>

            <div>
                <button
                    @click="sayHi"
                    :disabled="!isConnected"
                >
                    Say Hi!
                </button>
                <input 
                    type="text" 
                    placeholder="Send to..." 
                    v-model="sendClientId"
                    :disabled="!isConnected"
                >
            </div>

            <br>

            <div>
                <div>Play audio file</div>
                <input 
                    ref="audioFileInputEl"
                    type="file" 
                    name="audio-file"
                    :disabled="!isConnected || !isOwner"
                    @change="onAudioFileChange"
                >
                <button
                    @click="playAudio"
                    :disabled="!isConnected || !isOwner || isPlaying"
                >
                    Play
                </button>
                <button
                    @click="pauseAudio"
                    :disabled="!isConnected || !isOwner || !isPlaying"
                >
                    Pause
                </button>
            </div>

            <audio ref="audioPlayer"></audio>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters, mapActions } from "vuex";
import { Getters, MapGettersStructure, Actions, MapActionsStructure } from "../../store/modules/room";
import PeerManager from '../../rtc/PeerManager';
import SignallingSocket from '../../socket/SignallingSocket';
import RoomManager from '../../rtc/RoomManager';
import VueRouter from 'vue-router';

interface Data {
    sendClientId: string;
    isPlaying: boolean;

    audioFile: File;
}

type Computed = Pick<MapGettersStructure, 
        Getters.roomManager 
        | Getters.isConnected 
        | Getters.isOwner
        | Getters.connectedSocketClients
        | Getters.connectedRTCClients
        | Getters.id 
    > & {}

type Methods = Pick<MapActionsStructure, Actions.deleteRoomManager> & {
    leaveRoom(): void;
    sayHi(): void;
    onRoomLeft(): void;
    setupGeneralRTCListeners(peerManager: PeerManager): void;
    setupGeneralSocketListeners(socket: SignallingSocket): void;

    onAudioFileChange(): void;
    loadAudioFile(audioFile: File): void;
    syncAudioFile(audioFile: File): void;
    playAudio(): void;
    pauseAudio(): void;
}

export default Vue.extend({
    // TODO: add checks for if there is no roomManager
    // TODO: add proper tracking of currently connected clients (probably in room store)
    components: {

    },
    data() {
        return {
            sendClientId: "",
            isPlaying: false,

            audioFile: null
        }
    },
    computed: {
        ...mapGetters({
            roomManager: Getters.roomManager,
            isConnected: Getters.isConnected,
            isOwner: Getters.isOwner,
            connectedSocketClients: Getters.connectedSocketClients,
            connectedRTCClients: Getters.connectedRTCClients,
            id: Getters.id
        })
    },
    mounted() {
        // TODO: actually do something here
        const { isConnected }: Computed = this;
        if (!isConnected) {
            console.log("WARNING: Not connected to a room... you shouldn't be in here");
        } else {
            const { setupGeneralRTCListeners, setupGeneralSocketListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            setupGeneralRTCListeners(peerManager);
            setupGeneralSocketListeners(signallingSocket);
        }
    },
    methods: {
        ...mapActions({
            deleteRoomManager: Actions.deleteRoomManager
        }),
        sayHi() {
            const { sendClientId }: Data = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            peerManager.sendMessage(sendClientId.trim(), "Hello from the other side!");
        },
        leaveRoom() {
            const roomManager = this.roomManager as RoomManager;
            roomManager.leaveRoom();
        },
        onRoomLeft() {
            const { deleteRoomManager }: Methods = this;
            const router = this.$router as VueRouter;

            deleteRoomManager();

            // Go back to home page
            router.push('/');
        },
        setupGeneralRTCListeners(peerManager: PeerManager) {
            peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
                console.log("Message from", clientId, sourceEvent.data); // TODO: remove
            });
        },
        setupGeneralSocketListeners(socket: SignallingSocket) {
            socket.on("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });
        },
        onAudioFileChange() {
            // const { loadAudioFile, syncAudioFile }: Methods = this;
            // const audioFileInputEl = this.$refs.audioFileInputEl as HTMLInputElement;

            // const audioFile = audioFileInputEl.files[0];
        },
        loadAudioFile(audioFile: File) {

        },
        syncAudioFile(audioFile: File) {

        },
        playAudio() {

        },
        pauseAudio() {

        }
    }
});
</script>

<style lang="scss" scoped>

</style>
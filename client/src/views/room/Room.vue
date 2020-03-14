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
            <div>Sync Offset: {{ syncOffset }}</div>
            <div>Audio Loaded: {{ audioLoaded }}</div>
            <div>Audio Playing: {{ isPlaying }}</div>

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
                    :disabled="!isConnected || !isOwner || !audioLoaded || isPlaying"
                >
                    Play
                </button>
                <button
                    @click="pauseAudio"
                    :disabled="!isConnected || !isOwner || !audioLoaded || !isPlaying"
                >
                    Pause
                </button>
                <button
                    @click="stopAudio"
                    :disabled="!isConnected || !isOwner || !audioLoaded || !isPlaying"
                >
                    Stop
                </button>
            </div>

            <audio ref="audioPlayerEl"></audio>
        </div>
    </div>
</template>

<script lang="ts">
/// <reference path="../../timesync.d.ts" />

import Vue from 'vue';
import { mapState, mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import PeerManager from '../../rtc/PeerManager';
import SignallingSocket from '../../socket/SignallingSocket';
import RoomManager from '../../rtc/RoomManager';
import VueRouter from 'vue-router';
import { HighResolutionTimer } from "../../utilities";

interface Data {
    sendClientId: string;

    // isPlaying: boolean;

    // audioFile: File | null;
    // loadedAudio: boolean;

    syncOffset: number;
}

type Computed = {} &
    Pick<RoomStore.MapGettersStructure, 
        RoomStore.Getters.roomManager 
        | RoomStore.Getters.isConnected 
        | RoomStore.Getters.isOwner
        | RoomStore.Getters.connectedSocketClients
        | RoomStore.Getters.connectedRTCClients
        | RoomStore.Getters.id 
    > 
    & Pick<AudioStore.MapGettersStructure,
        AudioStore.Getters.isPlaying
        | AudioStore.Getters.audioFile
        | AudioStore.Getters.audioLoaded
    >

type Methods = Pick<RoomStore.MapActionsStructure, RoomStore.Actions.deleteRoomManager> & {
    leaveRoom(): void;
    onRoomLeft(): void;
    setupGeneralRoomListeners(roomManager: RoomManager): void;
    setupGeneralRTCListeners(peerManager: PeerManager): void;
    setupGeneralSocketListeners(socket: SignallingSocket): void;
    setupGeneralTimesyncListeners(timesync: Timesync): void;

    onAudioFileChange(): void;
    // loadAudioFile(audioFile: File): void;
    syncAudioFile(audioFile: File): void;
    playAudio(): void;
    pauseAudio(): void;
    stopAudio(): void;
}

export default Vue.extend({
    // TODO: add checks for if there is no roomManager
    // TODO: add proper tracking of currently connected clients (probably in room store)
    components: {

    },
    data() {
        return {
            sendClientId: "",
            // isPlaying: false,

            // audioFile: null,
            // loadedAudio: false,

            syncOffset: 0,
        }
    },
    computed: {
        ...mapGetters({
            roomManager: RoomStore.Getters.roomManager,
            isConnected: RoomStore.Getters.isConnected,
            isOwner: RoomStore.Getters.isOwner,
            connectedSocketClients: RoomStore.Getters.connectedSocketClients,
            connectedRTCClients: RoomStore.Getters.connectedRTCClients,
            id: RoomStore.Getters.id,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded
        })
    },
    mounted() {
        // TODO: actually do something here
        const { isConnected }: Computed = this;
        if (!isConnected) {
            console.log("WARNING: Not connected to a room... you shouldn't be in here");
        } else {
            const { 
                setupGeneralRoomListeners, 
                setupGeneralRTCListeners, 
                setupGeneralSocketListeners, 
                setupGeneralTimesyncListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            setupGeneralRoomListeners(roomManager);
            setupGeneralRTCListeners(peerManager);
            setupGeneralSocketListeners(signallingSocket);
            setupGeneralTimesyncListeners(peerManager.timesync);
        }
    },
    methods: {
        ...mapActions({
            deleteRoomManager: RoomStore.Actions.deleteRoomManager
        }),
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
        setupGeneralRoomListeners(roomManager: RoomManager) {
            // roomManager.addEventListener("audiofilereceived", (audioFile) => {
            //     console.log("Received audio file", audioFile);

            //     const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            //     audioPlayerEl.src = URL.createObjectURL(audioFile);
            //     audioPlayerEl.load();

            //     this.loadedAudio = true;
            // });

            // roomManager.addEventListener("playsignalreceived", startTime => {
            //     console.log("Start signal received for", startTime);

            //     const roomManager = this.roomManager as RoomManager;
            //     const peerManager = roomManager.peerManager as PeerManager;
            //     // const now = peerManager.timesync.now();
            //     const now = Date.now();

            //     // TODO: might have to check for null peer manager

            //     // const delay = startTime - Math.abs(now); // TODO: remove the abs hack
            //     // console.log("Timer delay", delay); // TODO: remove
            //     // const timer = new HighResolutionTimer(delay, () => {
            //     //     const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;
            //     //     if (!audioPlayerEl.src) return;

            //     //     console.log("Playing audio"); // TODO: remove
            //     //     audioPlayerEl.play();
            //     //     this.isPlaying = true;
            //     //     timer.stop();
            //     // });
            //     // timer.run();

            //     // TODO: actually use start time signal instead of just playing when the signal arrives
            //     const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;
            //     if (!audioPlayerEl.src) return;

            //     console.log("Playing audio"); // TODO: remove
            //     audioPlayerEl.play();
            //     this.isPlaying = true;
            // });

            // roomManager.addEventListener("pausesignalreceived", sentTime => {
            //     console.log("Pause signal received, sent at", sentTime);

            //     const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;
            //     if (!audioPlayerEl.src) return;

            //     audioPlayerEl.pause();
            // });

            // roomManager.addEventListener("stopsignalreceived", sentTime => {
            //     console.log("Stop signal received, sent at", sentTime);

            //     const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;
            //     if (!audioPlayerEl.src) return;

            //     audioPlayerEl.pause();
            //     audioPlayerEl.load();
            // });
        },
        setupGeneralRTCListeners(peerManager: PeerManager) {
            // peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
            //     console.log("Message from", clientId, sourceEvent.data); // TODO: remove
            // });
        },
        setupGeneralSocketListeners(socket: SignallingSocket) {
            socket.on("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });
        },
        setupGeneralTimesyncListeners(timesync: Timesync) {
            timesync.on("change", offset => {
                this.syncOffset = offset;
            });
        },
        onAudioFileChange() {
            // const { loadAudioFile, syncAudioFile }: Methods = this;
            const { syncAudioFile, stopAudio }: Methods = this;
            const audioFileInputEl = this.$refs.audioFileInputEl as HTMLInputElement;

            const audioFile = audioFileInputEl.files ? audioFileInputEl.files[0] : null;

            if (audioFile) {
                stopAudio();

                // loadAudioFile(audioFile);
                syncAudioFile(audioFile);
            }
        },
        // loadAudioFile(audioFile: File) {
        //     const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

        //     audioPlayerEl.src = URL.createObjectURL(audioFile);
        //     audioPlayerEl.load();

        //     this.loadedAudio = true;
        // },
        syncAudioFile(audioFile: File) {
            // TODO: sync to other clients
            const { connectedRTCClients }: Computed = this; 
            const roomManager = this.roomManager as RoomManager;

            roomManager.syncAudioFile(audioFile);
        },
        playAudio() {
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            // const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;
            // const now = peerManager.timesync.now();
            const now = Date.now();

            // TODO: might have to check for null peer manager

            // if (!audioPlayerEl.src) return;

            const startTime = roomManager.sendPlaySignal(100);

            // const delay = startTime - Math.abs(now); // TODO: remove the abs hack
            // console.log("Timer delay", delay); // TODO: remove
            // const timer = new HighResolutionTimer(delay, () => {
            //     console.log("Playing audio"); // TODO: remove
            //     audioPlayerEl.play();
            //     this.isPlaying = true;
            //     timer.stop();
            // });
            // timer.run();

            // TODO: delay start time instead of just playing right away
            // audioPlayerEl.play();
            // this.isPlaying = true;
        },
        pauseAudio() {
            const roomManager = this.roomManager as RoomManager;
            // const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            // if (!audioPlayerEl.src) return;

            roomManager.sendPauseSignal();

            // audioPlayerEl.pause();
            // this.isPlaying = false;
        },
        stopAudio() {
            const roomManager = this.roomManager as RoomManager;
            // const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            // if (!audioPlayerEl.src) return;

            roomManager.sendStopSignal();

            // audioPlayerEl.pause();
            // audioPlayerEl.load();
            // this.isPlaying = false;
        }
    }
});
</script>

<style lang="scss" scoped>

</style>
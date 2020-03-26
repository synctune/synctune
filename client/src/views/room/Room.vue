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
                Synced Clients
                <ul>
                    <li
                        :key="`syncedClient-${clientId}`"
                        v-for="(clientId) in syncedClients"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>

            <br>

            <!-- TODO: remove -->
            <button
                @click="syncClocks"
            >Sync Clocks</button>

            <br>
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
import RoomManager, { AudioFileMetadata } from '../../rtc/RoomManager';
import VueRouter from 'vue-router';

interface Data {
    sendClientId: string;
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
        | AudioStore.Getters.syncedClients
        | AudioStore.Getters.pausedAt
    >

type Methods = {
    leaveRoom(): void;
    setupGeneralTimesyncListeners(timesync: Timesync): void;

    onAudioFileChange(): void;
    syncAudioFile(audioFile: File): void;
    playAudio(): void;
    pauseAudio(): void;
    stopAudio(): void;

    syncClocks(): void; // TODO: remove
}

export default Vue.extend({
    // TODO: add checks for if there is no roomManager
    // TODO: add proper tracking of currently connected clients (probably in room store)
    components: {

    },
    data() {
        return {
            sendClientId: "",
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
            audioLoaded: AudioStore.Getters.audioLoaded,
            syncedClients: AudioStore.Getters.syncedClients,
            pausedAt: AudioStore.Getters.pausedAt,
        })
    },
    mounted() {
        // TODO: actually do something here
        const { isConnected }: Computed = this;
        if (!isConnected) {
            console.log("WARNING: Not connected to a room... you shouldn't be in here");
        } else {
            const { 
                setupGeneralTimesyncListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

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
        setupGeneralTimesyncListeners(timesync: Timesync) {
            timesync.on("change", offset => {
                this.syncOffset = offset;
            });
        },
        onAudioFileChange() {
            const { syncAudioFile, stopAudio }: Methods = this;
            const audioFileInputEl = this.$refs.audioFileInputEl as HTMLInputElement;

            const audioFile = audioFileInputEl.files ? audioFileInputEl.files[0] : null;

            if (audioFile) {
                stopAudio();
                syncAudioFile(audioFile);
            }
        },
        syncAudioFile(audioFile: File) {
            const roomManager = this.roomManager as RoomManager;

            const metadata: AudioFileMetadata = {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type
            };

            roomManager.syncAudioFile(audioFile, metadata);
        },
        playAudio() {
            const { pausedAt }: Computed = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            
            // TODO: figure out proper delay timing
            // Note: pausedAt will be 0 if we never paused before
            console.log("Playing at", pausedAt);
            const startTime = roomManager.sendPlaySignal(pausedAt, 100); 
        },
        pauseAudio() {
            const roomManager = this.roomManager as RoomManager;
            roomManager.sendPauseSignal();
        },
        stopAudio() {
            const roomManager = this.roomManager as RoomManager;
            roomManager.sendStopSignal();
        },
        syncClocks() { // TODO: remove
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            const timesync = peerManager.timesync;

            timesync.sync();
        }
    }
});
</script>

<style lang="scss" scoped>

</style>
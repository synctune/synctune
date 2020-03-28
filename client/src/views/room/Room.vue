<template>
    <div id="Room">
        <button
            @click="leaveRoom"
            :disabled="!isConnected"
        >
            Leave Room
        </button>

        <div>
            <div>Connected: {{ isConnected }}</div>
            <div>Is Room Owner: {{ isOwner }}</div>
            <div>ID: {{ id }}</div>
            <div>Timesynced: {{ timesynced }}</div>
            <div>Audio Loaded: {{ audioLoaded }}</div>
            <div>Audio Playing: {{ isPlaying }}</div>

            <br>

            <div>
                Connected Clients:
                <ul>
                    <li 
                        :key="`signalling-client-${clientId}`"
                        v-for="clientId in connectedClients"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>

            <br>

            <br>

            <div>
                Audio Synced Clients
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
                :disabled="!isOwner || !timesynced"
            >
                Sync Clocks
            </button>

            <br>
            <br>

            <div>
                <div>Play audio file</div>
                <input 
                    ref="audioFileInputEl"
                    type="file" 
                    name="audio-file"
                    :disabled="!isConnected || !isOwner || !timesynced"
                    @change="onAudioFileChange"
                >
                <button
                    @click="playAudio"
                    :disabled="!isConnected || !isOwner || !audioLoaded || isPlaying || !timesynced"
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
import VueRouter from 'vue-router';
import ConnectionManager, { AudioFileMetadata } from '../../rtc/ConnectionManager';

interface Data {
    sendClientId: string;
    syncOffset: number;
}

type Computed = {} &
    Pick<RoomStore.MapGettersStructure, 
        | RoomStore.Getters.connectionManager
        | RoomStore.Getters.isConnected 
        | RoomStore.Getters.isOwner
        | RoomStore.Getters.connectedClients
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
    // setupGeneralTimesyncListeners(timesync: Timesync): void;
    setupConnectionManagerListeners(connectionManager: ConnectionManager): void;

    onAudioFileChange(): void;
    syncAudioFile(audioFile: File): void;
    playAudio(): void;
    pauseAudio(): void;
    stopAudio(): void;

    syncClocks(): void; // TODO: remove
}

export default Vue.extend({
    // TODO: add checks for if there is no connection
    // TODO: add proper tracking of currently connected clients (probably in room store)
    components: {

    },
    data() {
        return {
            sendClientId: "",
            timesynced: false
        }
    },
    computed: {
        ...mapGetters({
            connectionManager: RoomStore.Getters.connectionManager,
            isConnected: RoomStore.Getters.isConnected,
            isOwner: RoomStore.Getters.isOwner,
            connectedClients: RoomStore.Getters.connectedClients,
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
            const { setupConnectionManagerListeners }: Methods = this;
            const connectionManager = this.connectionManager as ConnectionManager;

            this.timesynced = connectionManager.timesynced;
            setupConnectionManagerListeners(connectionManager);
        }
    },
    methods: {
        setupConnectionManagerListeners(connectionManager: ConnectionManager) {
            connectionManager.addEventListener("timesyncchanged", (timesynced) => {
                this.timesynced = timesynced;
            });
        },
        leaveRoom() {
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.leaveRoom();
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
            const connectionManager = this.connectionManager as ConnectionManager;

            const metadata: AudioFileMetadata = {
                name: audioFile.name,
                size: audioFile.size,
                type: audioFile.type
            };

            connectionManager.syncAudioFile(audioFile, metadata);
        },
        playAudio() {
            const { pausedAt }: Computed = this;
            const connectionManager = this.connectionManager as ConnectionManager;
            
            connectionManager.sendPlaySignal(pausedAt, 100);
        },
        pauseAudio() {
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.sendPauseSignal();
        },
        stopAudio() {
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.sendStopSignal();
        },
        syncClocks() { // TODO: remove
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.synchronizeClocks();
        }
    }
});
</script>

<style lang="scss" scoped>

</style>
<template>
    <div id="Room">
        <room-not-connected-view v-if="!isConnected" />
        <room-owner-view v-else-if="isOwner"/>
        <room-client-view v-else />
    </div>

    <!-- <div v-else id="Room">
        <button
            @click="leaveRoom"
            :disabled="!isConnected"
        >
            Leave Room
        </button>

        <div>
            <div>Room Name: {{ roomName }}</div>
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
                        {{ clientNickname(clientId) }} ({{ clientId }})
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
    </!-->
</template>

<script lang="ts">
/// <reference path="../../timesync.d.ts" />

import Vue from 'vue';
import { mapState, mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import VueRouter from 'vue-router';
import ConnectionManager, { AudioFileMetadata } from '../../rtc/ConnectionManager';

import RoomOwnerView from "@/components/room/RoomOwnerView.vue";
import RoomClientView from "@/components/room/RoomClientView.vue";
import RoomNotConnectedView from "@/components/room/RoomNotConnectedView.vue";

interface Data {}

type Computed = {
    clientNickname(clientId: string): string;
} & Pick<RoomStore.MapGettersStructure, 
        | RoomStore.Getters.connectionManager
        | RoomStore.Getters.isConnected 
        | RoomStore.Getters.isOwner
        | RoomStore.Getters.connectedClients
        | RoomStore.Getters.id 
        | RoomStore.Getters.roomName 
        | RoomStore.Getters.timesynced
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
        RoomOwnerView,
        RoomClientView,
        RoomNotConnectedView
    },
    computed: {
        ...mapGetters({
            connectionManager: RoomStore.Getters.connectionManager,
            isConnected: RoomStore.Getters.isConnected,
            isOwner: RoomStore.Getters.isOwner,
            connectedClients: RoomStore.Getters.connectedClients,
            id: RoomStore.Getters.id,
            roomName: RoomStore.Getters.roomName,
            timesynced: RoomStore.Getters.timesynced,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
            syncedClients: AudioStore.Getters.syncedClients,
            pausedAt: AudioStore.Getters.pausedAt,
        }),
        clientNickname() {
            const connectionManager = this.connectionManager as ConnectionManager;

            return (clientId: string) => {
                return connectionManager.getClientNickname(clientId);
            }
        }
    },
    mounted() {
        // TODO: actually do something here
        const { isConnected }: Computed = this;
        if (!isConnected) {
            console.log("WARNING: Not connected to a room... you shouldn't be in here");
        } else {
            const { setupConnectionManagerListeners }: Methods = this;
            const connectionManager = this.connectionManager as ConnectionManager;
            setupConnectionManagerListeners(connectionManager);
        }
    },
    methods: {
        setupConnectionManagerListeners(connectionManager: ConnectionManager) {
            
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
    #Room {
        margin: 0 3rem;

        height: 100%;

        @include respond(phone) {
            margin: 0 2rem;
        }
    }
</style>
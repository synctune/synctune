<template>
    <div id="RoomOwnerView">
        <back-button 
            id="RoomOwnerView__back-button" 
            @click="gotoHomePage"
        />

        <div id="RoomOwnerView__room-code-container">
            <div id="RoomOwnerView__room-code-title">
                Room Code:
            </div>
            <div id="RoomOwnerView__room-code">
                {{ roomName }}
            </div>
        </div>

        <div id="RoomOwnerView__room-controls">
            <upload-button 
                id="RoomOwnerView__upload-audio"
                name="room-file-input"
                accept="audio/*"
                :disabled="!timesynced && hasClients"
                @change="onAudioFileChange"
            />

            <sync-button 
                id="RoomOwnerView__sync-button"
                size="5rem"
                icon-size="3rem"
                :syncing="!timesynced && hasClients"
                :disabled="!hasClients"
                :sync-progress="syncProgress"
                @click="timesyncClients"
            />
        </div>

        <div id="RoomOwnerView__connected-devices-container">
            <div 
                id="RoomOwnerView__connected-devices-title" 
                class="RoomOwnerView__container-title"
            >
                Connected Devices
            </div>
            <connected-devices-container 
                id="RoomOwnerView__connected-devices"
                :clients="containerClientList"
                @kick="kickClient"
            />
        </div>

        <div id="RoomOwnerView__music-controls-container">
            <div 
                id="RoomOwnerView__music-controls-title"
                class="RoomOwnerView__container-title"
            >
                Music Controls
            </div>
            <music-controls-container 
                id="RoomOwnerView__music-controls"
                :can-play="audioLoaded && (timesynced || !hasClients)"
                :is-playing="isPlaying"
                :track-title="audioTrackTitle"
                @play="playAudio"
                @pause="pauseAudio"
                @stop="stopAudio"
            />
        </div>

        <button-secondary 
            id="RoomOwnerView__leave-room"
            @click="leaveRoom"
        >
            Leave Room
        </button-secondary>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters, mapActions } from "vuex";
import VueRouter from 'vue-router';
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import ConnectionManager, { AudioFileMetadata } from '../../managers/ConnectionManager';
import { AUDIO_CHUNK_SIZE, TIMESYNC_REPEAT } from "../../constants/generalConstants";

import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import ConnectedDevicesContainer, { Client as ContainerClient } from "./owner/ConnectedDevicesContainer.vue";
import MusicControlsContainer from "@/components/room/owner/MusicControlsContainer.vue";
import UploadButton from "@/components/ui/button/UploadButton.vue";
import SyncButton from "@/components/ui/button/SyncButton.vue";
import BackButton from "@/components/ui/button/BackButton.vue";

type Computed = {
    audioTrackTitle: string | null;
    hasClients: boolean;
    containerClientList: ContainerClient[];
    syncProgress: number;
} & Pick<RoomStore.MapGettersStructure,
    | RoomStore.Getters.connectionManager
    | RoomStore.Getters.connectedClients
    | RoomStore.Getters.id 
    | RoomStore.Getters.roomName 
    | RoomStore.Getters.timesynced
    | RoomStore.Getters.timesyncProgressCounter
> & Pick<AudioStore.MapGettersStructure,
    AudioStore.Getters.isPlaying
    | AudioStore.Getters.audioFileMetadata
    | AudioStore.Getters.audioFile
    | AudioStore.Getters.audioLoaded
    | AudioStore.Getters.pausedAt
>;

type Methods = {
    kickClient(clientId: string): void;
    timesyncClients(): void;
    onAudioFileChange(e: MouseEvent): void;
    syncAudioFile(audioFile: File): void;
    playAudio(): void;
    pauseAudio(): void;
    stopAudio(): void;
    gotoHomePage(): void;
    leaveRoom(): void;
};

export default Vue.extend({
    components: {
        ConnectedDevicesContainer,
        MusicControlsContainer,
        ButtonSecondary,
        UploadButton,
        SyncButton,
        BackButton
    },
    data() {
        return {
            // TODO: remove
            tempSyncing: false,
            tempSyncProgress: 0,
            mockClients: [
                { id: "ad2q23eq", nickname: "Alec", status: "ready" },
                { id: "dadawwa78", nickname: "Jeff", status: "syncing" },
                { id: "ddwa7da", nickname: "Anto", status: "uploading", uploadProgress: 50 },
                { id: "ddaw8vb", nickname: "Kamin", status: "loading" },
                { id: "wdwa9f09", nickname: "Thierry Mr Long Name", status: "error" }
            ]
        }
    },
    computed: {
        ...mapGetters({
            connectionManager: RoomStore.Getters.connectionManager,
            connectedClients: RoomStore.Getters.connectedClients,
            id: RoomStore.Getters.id,
            roomName: RoomStore.Getters.roomName,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFileMetadata: AudioStore.Getters.audioFileMetadata,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
            pausedAt: AudioStore.Getters.pausedAt,
            timesynced: RoomStore.Getters.timesynced,
            timesyncProgressCounter: RoomStore.Getters.timesyncProgressCounter
        }),
        audioTrackTitle() {
            const audioFileMetadata = this.audioFileMetadata as AudioFileMetadata;
            return (audioFileMetadata) ? audioFileMetadata.name : null;
        },
        hasClients() {
            const { connectedClients }: Computed = this;
            return connectedClients.length > 0;
        },
        containerClientList() {
            const { connectedClients, audioFile }: Computed = this;
            const numChunks = (audioFile) ? Math.ceil(audioFile.size / AUDIO_CHUNK_SIZE) : null;

            return connectedClients.map(clientData => {
                const uploadProgress = (audioFile) ? clientData.uploadedChunks / numChunks * 100 : null;

                const transData: ContainerClient = {
                    id: clientData.id,
                    nickname: clientData.nickname,
                    status: clientData.state,
                    uploadProgress
                }
                return transData;
            });
        },
        syncProgress() {
            const { timesyncProgressCounter }: Computed = this;
            return timesyncProgressCounter / TIMESYNC_REPEAT / 2 * 100;
        }
    },
    methods: {
        kickClient(clientId: string) {
            // TODO: implement
            console.log("Kicking client", clientId);

            // // TODO: remove this stuff
            // // Test code that randomly changes the status of the client whenever the kick button is clicked
            // const idx = this.mockClients.findIndex((data: any) => data.id === clientId);
            // const rand = Math.floor(Math.random() * Math.floor(5));
            // const statusMap = ['ready', 'syncing', 'uploading', 'loading', 'error'];
            // console.log(`Setting status of client '${clientId}'(${idx}) to '${statusMap[rand]}'`);
            // this.mockClients[idx].status = statusMap[rand];
        },
        timesyncClients() {
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.synchronizeClocks();

            // // TODO: remove this stuff
            // this.tempSyncProgress = 0;
            // this.tempSyncing = true;

            // setTimeout(() => this.tempSyncProgress = 10, 700);
            // setTimeout(() => this.tempSyncProgress = 45, 1600);
            // setTimeout(() => this.tempSyncProgress = 80, 2200);
            // setTimeout(() => this.tempSyncProgress = 90, 2800);
            // setTimeout(() => { this.tempSyncProgress = 100; this.tempSyncing = false }, 3650);
        },
        onAudioFileChange(e: MouseEvent) {
            const { syncAudioFile, stopAudio }: Methods = this;
            const target = e.target as HTMLInputElement;
            const audioFile = target.files ? target.files[0] : null;

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
        gotoHomePage() {
            const router = this.$router as VueRouter;
            router.push("/").catch(err => {});
        },
        leaveRoom() {
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.leaveRoom();
        }
    }
});
</script>

<style lang="scss" scoped>
    $max-container-width: 45rem;
    $connected-devices-min-height: 18rem;
    $vertical-margins: 1rem;

    #RoomOwnerView {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;

        height: 100%;

        padding: $vertical-margins;

        & > :not(:last-child) {
            margin-bottom: 1.3rem;
        }

        & #RoomOwnerView__back-button {
            position: absolute;
            top: 0;
            left: 0;

            margin-top: $vertical-margins;
        }

        & .RoomOwnerView__container-title {
            font-size: 2.5rem;
            font-weight: 600;
            text-align: center;
        }

        & #RoomOwnerView__room-code-container {
            text-align: center;

            & #RoomOwnerView__room-code-title {
                font-size: 1.8rem;
            }

            & #RoomOwnerView__room-code {
                font-size: 2.3rem;
                font-weight: 700;
            }
        }

        & #RoomOwnerView__room-controls {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            grid-template-areas: 
                "left-side center right-side";

            width: 100%;

            & #RoomOwnerView__upload-audio {
                grid-area: center;
                justify-self: center;
                align-self: center;
            }

            & #RoomOwnerView__sync-button {
                margin-left: 2.5rem;

                @include respond(phone) {
                    margin-left: 1.5rem;
                }

                grid-area: right-side;
                align-self: center;
            }
        }

        & #RoomOwnerView__connected-devices-container {
            flex-grow: 0;
            flex-shrink: 1;

            width: 100%;
            max-width: $max-container-width;

            // min-height: $connected-devices-min-height;

            display: flex;
            flex-direction: column;

            & #RoomOwnerView__connected-devices-title {
                
            }

            & #RoomOwnerView__connected-devices {
                min-height: 3rem;

                flex-grow: 0;
                flex-shrink: 1;
                min-height: 0;

                // overflow: auto;
            }
        }

        & #RoomOwnerView__music-controls-container {
            width: 100%;
            max-width: $max-container-width;

            & #RoomOwnerView__music-controls-title {

            }

            & #RoomOwnerView__music-controls {

            }
        }

        & #RoomOwnerView__leave-room {
            
        }
    }
</style>
<template>
    <div id="RoomOwnerView">
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
                @change="onAudioFileChange"
            />

            <div id="RoomOwnerView__sync-button">Sync Button</div>
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
            />
        </div>

        <button-secondary 
            id="RoomOwnerView__leave-room"
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
import ConnectionManager, { AudioFileMetadata } from '../../rtc/ConnectionManager';

import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import ConnectedDevicesContainer from "@/components/room/owner/ConnectedDevicesContainer.vue";
import MusicControlsContainer from "@/components/room/owner/MusicControlsContainer.vue";
import UploadButton from "@/components/ui/button/UploadButton.vue";

type Computed = {} 
    & Pick<RoomStore.MapGettersStructure,
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
    >;

type Methods = {
    onAudioFileChange(e: MouseEvent): void;
};

export default Vue.extend({
    components: {
        ConnectedDevicesContainer,
        MusicControlsContainer,
        ButtonSecondary,
        UploadButton,
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
        })
    },
    methods: {
        onAudioFileChange(e: MouseEvent) {
            // TODO: implement
            console.log("Audio File changed", e);
        }
    }
});
</script>

<style lang="scss" scoped>
    $max-container-width: 45rem;

    #RoomOwnerView {
        display: flex;
        flex-direction: column;
        align-items: center;

        height: 100%;

        & > :not(:last-child) {
            margin-bottom: 1.3rem;
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
            // display: flex;
            // flex-direction: row;
            // align-items: center;

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
                margin-left: 1.5rem;

                grid-area: right-side;
                align-self: center;
            }
        }

        & #RoomOwnerView__connected-devices-container {
            flex-grow: 1;

            width: 100%;
            max-width: $max-container-width;

            display: flex;
            flex-direction: column;

            & #RoomOwnerView__connected-devices-title {
                
            }

            & #RoomOwnerView__connected-devices {
                min-height: 3rem;

                flex-grow: 1;
                flex-shrink: 1;
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
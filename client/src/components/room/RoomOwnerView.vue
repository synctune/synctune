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
            Upload Button
            <br>
            Sync Button
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

export default Vue.extend({
    components: {
        ConnectedDevicesContainer,
        MusicControlsContainer,
        ButtonSecondary
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
    }
});
</script>

<style lang="scss" scoped>
    #RoomOwnerView {
        display: flex;
        flex-direction: column;
        align-items: center;

        height: 100%;

        & .RoomOwnerView__container-title {
            font-size: 2.5rem;
            font-weight: 600;
            text-align: center;
        }

        // background-color: rebeccapurple;

        & #RoomOwnerView__room-code-container {

        }

        & #RoomOwnerView__room-controls {
            
        }

        & #RoomOwnerView__connected-devices-container {
            flex-grow: 1;

            width: 100%;

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

            & #RoomOwnerView__music-controls-title {

            }

            & #RoomOwnerView__music-controls {

            }
        }

        & #RoomOwnerView__leave-room {

        }
    }
</style>
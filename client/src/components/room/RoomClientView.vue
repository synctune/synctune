<template>
    <div class="RoomClientView">
        <div id="RoomClientView__room-code-container">
            <div id="RoomClientView__room-code-title">
                Room Code:
            </div>
            <div id="RoomClientView__room-code">
                {{ roomName }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import { mapState, mapGetters, mapActions } from "vuex";

type Computed = {} 
    & Pick<RoomStore.MapGettersStructure,
        RoomStore.Getters.connectionManager
        | RoomStore.Getters.isConnected 
        | RoomStore.Getters.isOwner
        | RoomStore.Getters.id 
        | RoomStore.Getters.roomName
    >
    & Pick<AudioStore.MapGettersStructure,
        AudioStore.Getters.isPlaying
        | AudioStore.Getters.audioFile
        | AudioStore.Getters.audioLoaded
    >;

export default Vue.extend({
    computed: {
        ...mapGetters({
            connectionManager: RoomStore.Getters.connectionManager,
            isConnected: RoomStore.Getters.isConnected,
            isOwner: RoomStore.Getters.isOwner,
            id: RoomStore.Getters.id,
            roomName: RoomStore.Getters.roomName,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
        })
    },
})
</script>

<style lang="scss" scoped>
    #RoomClientView {
        display: flex;
        flex-direction: column;
        align-items: center;

        height: 100%;

        & #RoomClientView__room-code-container {
            text-align: center;

            & #RoomClientView__room-code-title {
                font-size: 1.8rem;
            }

            & #RoomClientView__room-code {
                font-size: 2.3rem;
                font-weight: 700;
            }
        }
    }
</style>
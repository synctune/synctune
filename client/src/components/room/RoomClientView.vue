<template>
    <div id="RoomClientView">
        <back-button 
            id="RoomClientView__back-button" 
            @click="onBackClick"
        />

        <div id="RoomClientView__room-code-container">
            <div id="RoomClientView__room-code-title">
                Room Code:
            </div>
            <div id="RoomClientView__room-code">
                {{ roomName }}
            </div>
        </div>

        <audio-visualizer-circle 
            id="RoomClientView__audio-visualizer"
            :disabled="false"
            :audio-context="null"
        />

        <div id="RoomClientView__current-song-container">
            <div 
                id="RoomClientView__current-song-title"
                class="RoomClientView__container-title"
            >
                Music Controls
            </div>

            <current-song-container 
                id="RoomClientView__current-song"
                :is-playing="false"
                :track-title="null"
                @compensate-forwards="onCompensateForwards"
                @compensate-backwards="onCompensateBackwards"
            />
        </div>

        <button-secondary 
            id="RoomClientView__leave-room"
            @click="onLeaveRoom"
        >
            Leave Room
        </button-secondary>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import VueRouter from 'vue-router';
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import { mapState, mapGetters, mapActions } from "vuex";

import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import BackButton from "@/components/ui/button/BackButton.vue";
import CurrentSongContainer from "@/components/room/client/CurrentSongContainer.vue";
import AudioVisualizerCircle from "@/components/audio/AudioVisualizerCircle.vue";

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

type Methods = {
    onLeaveRoom(): void;
    onBackClick(): void;
    onCompensateForwards(): void;
    onCompensateBackwards(): void;
} 

export default Vue.extend({
    components: {
        ButtonSecondary,
        BackButton,
        CurrentSongContainer,
        AudioVisualizerCircle
    },
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
    methods: {
        onBackClick() {
            const router = this.$router as VueRouter;
            router.push("/").catch(err => {});
        },
        onLeaveRoom() {
            // TODO: implement
        },
        onCompensateForwards() {
            // TODO: implement
        },
        onCompensateBackwards() {
            // TODO: implement
        }
    }
})
</script>

<style lang="scss" scoped>
    $max-container-width: 45rem;
    $connected-devices-min-height: 18rem;
    $vertical-margins: 1rem;
    $spacing-margin: 1.3rem;

    #RoomClientView {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;

        height: 100%;

        padding: $vertical-margins;

        & > :not(:last-child) {
            margin-bottom: $spacing-margin;
        }

        & #RoomClientView__back-button {
            position: absolute;
            top: 0;
            left: 0;

            margin-top: $vertical-margins;
        }

        & .RoomClientView__container-title {
            font-size: 2.5rem;
            font-weight: 600;
            text-align: center;
        }

        & #RoomClientView__audio-visualizer {
            $extra-margin: 1.3rem;
            margin: ($extra-margin) 0 ($spacing-margin + $extra-margin) 0;

            @include respond(phone) {
                $extra-margin: 0.5rem;
                margin: ($extra-margin) 0 ($spacing-margin + $extra-margin) 0;
            }
        }

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

        & #RoomClientView__current-song-container {
            width: 100%;
            max-width: $max-container-width;

            & #RoomClientView__current-song-title {

            }

            & #RoomClientView__current-song {

            }
        }
    }
</style>
<template>
    <div id="RoomClientView">
        <back-button 
            id="RoomClientView__back-button" 
            @click="gotoHomePage"
        />

        <div id="RoomClientView__room-code-container">
            <div id="RoomClientView__room-code-title">
                Room Code:
            </div>
            <div id="RoomClientView__room-code" class="GLOBAL-monospace-font">
                {{ roomName }}
            </div>
        </div>

        <audio-visualizer-circle 
            id="RoomClientView__audio-visualizer"
            :disabled="!isPlaying || !audioLoaded"
            :audio-context="audioContext"
            :audio-source="audioSource"
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
                :is-playing="isPlaying"
                :audio-loaded="audioLoaded"
                :track-title="audioTrackTitle"
                @compensate-forwards="compensateForwards"
                @compensate-backwards="compensateBackwards"
            />
        </div>

        <button-secondary 
            id="RoomClientView__leave-room"
            @click="leaveRoom"
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
import { mapGetters, mapActions } from "vuex";
import ConnectionManager, { AudioFileMetadata } from '../../managers/ConnectionManager';
import { AUDIO_COMPENSATE_AMOUNT } from "../../constants";

import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import BackButton from "@/components/ui/button/BackButton.vue";
import CurrentSongContainer from "@/components/room/client/CurrentSongContainer.vue";
import AudioVisualizerCircle from "@/components/audio/AudioVisualizerCircle.vue";

type Computed = {
    audioTrackTitle: string | null;
} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.connectionManager
    | RoomStore.Getters.roomName
>
& Pick<AudioStore.MapGettersStructure,
    AudioStore.Getters.isPlaying
    | AudioStore.Getters.audioFileMetadata
    | AudioStore.Getters.audioLoaded
    | AudioStore.Getters.audioContext
    | AudioStore.Getters.audioBuffer
    | AudioStore.Getters.audioSource
    | AudioStore.Getters.startedAt
    | AudioStore.Getters.totalCompensation
>;

type Methods = {
    gotoHomePage(): void;
    onLeaveRoom(): void;
    compensateForwards(): void;
    compensateBackwards(): void;
    compensateAudio(compensationAmount: number): void;
} & Pick<AudioStore.MapActionsStructure, 
    AudioStore.Actions.setTotalCompensation
>

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
            roomName: RoomStore.Getters.roomName,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFileMetadata: AudioStore.Getters.audioFileMetadata,
            audioLoaded: AudioStore.Getters.audioLoaded,
            audioContext: AudioStore.Getters.audioContext,
            audioBuffer: AudioStore.Getters.audioBuffer,
            audioSource: AudioStore.Getters.audioSource,
            startedAt: AudioStore.Getters.startedAt,
            totalCompensation: AudioStore.Getters.totalCompensation
        }),
        audioTrackTitle() {
            const audioFileMetadata = this.audioFileMetadata as AudioFileMetadata;
            return (audioFileMetadata) ? audioFileMetadata.name : null;
        },
    },
    methods: {
        ...mapActions({
            setTotalCompensation: AudioStore.Actions.setTotalCompensation
        }),
        gotoHomePage() {
            const router = this.$router as VueRouter;
            router.push("/").catch(() => {});
        },
        leaveRoom() {
            const connectionManager = this.connectionManager as ConnectionManager;
            connectionManager.leaveRoom();
        },
        compensateForwards() {
            const { compensateAudio }: Methods = this;
            compensateAudio(AUDIO_COMPENSATE_AMOUNT);
        },
        compensateBackwards() {
            const { compensateAudio }: Methods = this;
            compensateAudio(-1 * AUDIO_COMPENSATE_AMOUNT);
        },
        compensateAudio(compensationAmount: number) {
            const { audioContext, startedAt, totalCompensation }: Computed = this;
            const { setTotalCompensation }: Methods = this;
            const connectionManager = this.connectionManager as ConnectionManager;

            // Update total compensation
            const newTotalCompensation = totalCompensation + compensationAmount;
            setTotalCompensation({ totalCompensation: newTotalCompensation });

            // Play audio at newly compensated time
            connectionManager.sendPlaySignal(audioContext.currentTime - startedAt, 0, true, true, true);
        }
    }
})
</script>

<style lang="scss">
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
        }

        & #RoomClientView__leave-room {
            margin-bottom: 1rem;
        }
    }
</style>
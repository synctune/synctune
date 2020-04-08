<template>
    <container 
        :class="[
            'MusicControlsContainer',
            (trackIsLoaded) ? 'track-loaded' : null
        ]"
        base-class="MusicControlsContainer__container"
        :vertical-accents="false"
    >
        <artwork-thumbnail 
            class="MusicControlsContainer__artwork-thumbnail"
        />

        <div class="MusicControlsContainer__song-title">
            {{ trackTitleDisplay }}
        </div>

        <div class="MusicControlsContainer__controls">
            <circular-icon-button 
                class="MusicControlsContainer__pause-button"
                icon-name="pause-icon"
                @click="$emit('pause', $event)"
                size="4rem"
                icon-size="2.5rem"
                :disabled="!isPlaying || !canPlay"
            />

            <circular-icon-button 
                class="MusicControlsContainer__play-button"
                icon-name="play-icon"
                @click="$emit('play', $event)"
                size="6rem"
                icon-size="4.5rem"
                :disabled="isPlaying || !canPlay"
            />

            <circular-icon-button 
                class="MusicControlsContainer__stop-button"
                icon-name="stop-icon"
                @click="$emit('stop', $event)"
                size="4rem"
                icon-size="2.5rem"
                :disabled="!isPlaying || !canPlay"
            />
        </div>

        <audio-seekbar 
            class="MusicControlsContainer__audio-seekbar"
            :song-length="songLength"
            :current-time="currentTime"
            @seek="$emit('seek', $event)"
        />
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import Container from "@/components/ui/Container.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";
import CircularIconButton from "@/components/ui/button/CircularIconButton.vue";
import AudioSeekbar from "@/components/audio/AudioSeekbar.vue";

interface Props {
    trackTitle: string | null;
    isPlaying: boolean;
    canPlay: boolean;
}

interface Computed {
    trackTitleDisplay: string;
    trackIsLoaded: boolean;
}

export default Vue.extend({
    components: {
        Container,
        ArtworkThumbnail,
        CircularIconButton,
        AudioSeekbar
    },
    props: {
        trackTitle: {
            type: String,
            default: null
        },
        isPlaying: {
            type: Boolean,
            default: false
        },
        canPlay: {
            type: Boolean,
            default: false
        },
        songLength: { // Seconds
            type: Number,
            default: null
        },
        currentTime: { // Seconds
            type: Number,
            default: 0
        }
    },
    computed: {
        trackTitleDisplay() {
            const { trackTitle }: Props = this;
            return (trackTitle) ? trackTitle : "<no track currently loaded>";
        },
        trackIsLoaded() {
            const { trackTitle }: Props = this;
            return trackTitle != null;
        }
    }
});
</script>

<style lang="scss">
    .MusicControlsContainer {
        width: 100%;

        & .MusicControlsContainer__container {
            display: flex;
            flex-direction: column;
            align-items: center;

            padding: 1rem 0;

            & > *:not(:last-child) {
                margin-bottom: 1rem;
            }

            & .MusicControlsContainer__song-title {
                font-size: 1.8rem;
                font-weight: 500;

                text-align: center;

                color: color-link("MusicControlsContainer", "text", "primary");
            }

            & .MusicControlsContainer__controls {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;

                & > *:not(:last-child) {
                    margin-right: 1rem;
                }
            }
        }

        &:not(.track-loaded) {
            & .MusicControlsContainer__song-title {
                color: color-link("MusicControlsContainer", "text", "disabled");
            }
        }
    }
</style>
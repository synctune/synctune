<template>
    <container
        :class="[
            'CurrentSongContainer',
            (isPlaying) ? 'is-playing' : null
        ]"
        base-class="CurrentSongContainer__container"
        :vertical-accents="false"
    >
        <artwork-thumbnail 
            class="CurrentSongContainer__artwork-thumbnail"
        />

        <div class="CurrentSongContainer__song-title">
            {{ trackTitleDisplay }}
        </div>

        <div class="CurrentSongContainer__compensation-controls">
            <compensate-backwards-button 
                class="CurrentSongContainer__compensation-backwards-button"
                size="4rem"
                primary-icon-size="2rem"
                secondary-icon-size="0.7rem"
                :disabled="!isPlaying"
                @click="$emit('compensate-backwards', $event)"
            />

            <compensate-forwards-button 
                class="CurrentSongContainer__compensation-forwards-button"
                size="4rem"
                primary-icon-size="2rem"
                secondary-icon-size="0.7rem"
                :disabled="!isPlaying"
                @click="$emit('compensate-forwards', $event)"
            />
        </div>

        <div class="CurrentSongContainer__compensate-info-blurb">
            Compensate audio playback
        </div>
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import Container from "@/components/ui/Container.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";
import CompensateBackwardsButton from "@/components/ui/button/CompensateBackwardsButton.vue";
import CompensateForwardsButton from "@/components/ui/button/CompensateForwardsButton.vue";

interface Props {
    isPlaying: boolean;
    trackTitle: string | null;
}

interface Computed {
    trackTitleDisplay: string;
}

export default Vue.extend({
    components: {
        Container,
        ArtworkThumbnail,
        CompensateBackwardsButton,
        CompensateForwardsButton
    },
    props: {
        isPlaying: {
            type: Boolean,
            default: false
        },
        trackTitle: {
            type: String,
            default: null
        }
    },
    computed: {
        trackTitleDisplay() {
            const { trackTitle }: Props = this;
            return (trackTitle) ? trackTitle : "<no track currently loaded>";
        },
    }
});
</script>

<style lang="scss" scoped>
    .CurrentSongContainer {
        width: 100%;

        & /deep/ .CurrentSongContainer__container {
            display: flex;
            flex-direction: column;
            align-items: center;

            padding: 1rem 0;

            & > *:not(:last-child) {
                margin-bottom: 1rem;
            }

            & /deep/ .CurrentSongContainer__song-title {
                font-size: 1.8rem;
                font-weight: 500;

                text-align: center;

                color: color-link("CurrentSongContainer", "text", "primary");
            }

            & /deep/ .CurrentSongContainer__compensation-controls {
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                flex-wrap: wrap;

                & > *:not(:last-child) {
                    margin-right: 2rem;
                }
            }

            & /deep/ .CurrentSongContainer__compensate-info-blurb {
                font-size: 1.2rem;
                text-align: center;

                color: color-link("CurrentSongContainer", "text", "disabled");
            }
        }

        &:not(.is-playing) {
            & /deep/ .CurrentSongContainer__song-title {
                color: color-link("CurrentSongContainer", "text", "disabled");
            }
        }
    }
</style>
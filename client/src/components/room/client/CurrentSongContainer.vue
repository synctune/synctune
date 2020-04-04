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

    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import Container from "@/components/ui/Container.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";

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
        ArtworkThumbnail
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

            & /deep/ .CurrentSongContainer__controls {
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

        &:not(.is-playing) {
            & /deep/ .CurrentSongContainer__song-title {
                color: color-link("CurrentSongContainer", "text", "disabled");
            }
        }
    }
</style>
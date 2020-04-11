<template>
    <div 
        :class="[
            'AudioSeekbar',
            (isLoaded) ? 'is-loaded' : null
        ]"
    >
        <div class="AudioSeekbar__times">
            <div class="AudioSeekbar__current-time">
                {{ currentTimeText }}
            </div>
            <div class="AudioSeekbar__total-time">
                {{ totalTimeText }}
            </div>
        </div>
        <div 
            class="AudioSeekbar__seeker"
            ref="seekbarEl"
            @mousemove="onSeekMouseMove"
            @mouseleave="onSeekMouseLeave"
            @click="onSeekbarClick"
        >
            <div 
                class="AudioSeekbar__seek-progress"
                :style="{ width: `${currentTimePercent}%` }"
            ></div>

            <div 
                v-if="displayPreview"
                class="AudioSeekbar__seek-preview"
                :style="{ width: `${previewPercent}%` }"
            ></div>

            <div 
                v-if="displayPreview"
                class="AudioSeekbar__seek-preview-popup"
                :style="{ left: `${previewPercent}%` }"
            >
                {{ previewTimeText }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../utilities";

interface Props {
    songLength: number | null;
    currentTime: number;
}

interface Data {
    displayPreview: boolean;
    previewPercent: number;
}

interface Computed {
    isLoaded: boolean;
    currentTimeText: string;
    totalTimeText: string;
    previewTimeText: string;
    currentTimePercent: number;
}

interface Methods {
    onSeekbarClick(event: MouseEvent): void;
    onSeekMouseMove(event: MouseEvent): void;
    onSeekMouseMove(): void;
}

export default Vue.extend({
    props: {
        songLength: { // Seconds
            type: Number,
            default: null
        },
        currentTime: { // Seconds
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            displayPreview: false,
            previewPercent: 0
        }
    },
    computed: {
        isLoaded() {
            const { songLength }: Props = this;
            return songLength !== null;
        },
        currentTimeText() {
            const { currentTime }: Props = this;
            const { isLoaded }: Computed = this;

            if (!isLoaded) return "-- : --";

            return Utilities.displaySecondsString(currentTime);
        },
        totalTimeText() {
            const { songLength }: Props = this;
            const { isLoaded }: Computed = this;

            if (!isLoaded) return "-- : --";

            return Utilities.displaySecondsString(songLength!);
        },
        previewTimeText() {
            const { songLength }: Props = this;
            const { previewPercent }: Data = this;
            const { isLoaded }: Computed = this;

            if (!isLoaded) return "-- : --";

            const previewTime = songLength! * previewPercent / 100;
            return Utilities.displaySecondsString(previewTime);
        },
        currentTimePercent() {
            const { currentTime, songLength }: Props = this;
            const { isLoaded }: Computed = this;

            if (!isLoaded) return 0;

            return currentTime / songLength! * 100;
        }
    },
    methods: {
        onSeekbarClick(event: MouseEvent) {
            const { songLength }: Props = this;
            const { isLoaded }: Computed = this;
            const seekbarEl = this.$refs.seekbarEl as HTMLElement;

            if (!isLoaded || !seekbarEl) return;

            const posPercent = event.offsetX / seekbarEl.offsetWidth;
            const seekToTime = songLength! * posPercent;

            this.$emit("seek", seekToTime);
        },
        onSeekMouseMove(event: MouseEvent) {
            const seekbarEl = this.$refs.seekbarEl as HTMLElement;

            if (!seekbarEl) return;

            const posPercent = event.offsetX / seekbarEl.offsetWidth * 100;

            this.displayPreview = true;
            this.previewPercent = posPercent;
        },
        onSeekMouseLeave() {
            this.displayPreview = false;
            this.previewPercent = 0;
        }
    }
});
</script>

<style lang="scss">
    $gen-transition-time: 0.3s;
    $seek-transition-time: 0.1s;
    $radius-amount: 0.35rem;
    $height: 0.7rem;
    $sides-padding: 0.8rem;

    .AudioSeekbar {
        display: flex;
        flex-direction: column;

        width: 100%;
        max-width: 25rem;

        padding: 0 $sides-padding;

        & .AudioSeekbar__times {
            width: 100%;

            display: flex;
            flex-direction: row;
            justify-content: space-between;

            & .AudioSeekbar__current-time, & .AudioSeekbar__total-time {
                font-size: 1rem;

                color: color-link("AudioSeekbar", "text", "primary");

                transition: color $gen-transition-time;
            }
        }

        & .AudioSeekbar__seeker {
            position: relative;

            width: 100%;
            height: $height;

            background-color: color-link("AudioSeekbar", "background", "primary");
            border-radius: $radius-amount;

            transition: background-color $gen-transition-time;

            & .AudioSeekbar__seek-progress {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;

                background-color: color-link("AudioSeekbar", "background", "secondary");
                border-radius: $radius-amount;

                transition: width $seek-transition-time;
            }

            & .AudioSeekbar__seek-preview {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;

                background-color: rgba(0, 0, 0, 0.25);
                border-radius: $radius-amount;
            }

            & .AudioSeekbar__seek-preview-popup {
                position: absolute;
                bottom: 100%;

                font-size: 1.2rem;
                border-radius: $radius-amount;

                color: color-link("AudioSeekbar", "text_inverted", "primary");
                background-color: rgba(0, 0, 0, 0.6);

                padding: 0.2rem 0.3rem;
                margin-bottom: 0.2rem;

                transform: translateX(-50%);
            }
        }

        &:not(.is-loaded) {
            pointer-events: none;

            & .AudioSeekbar__times {
                & .AudioSeekbar__current-time, & .AudioSeekbar__total-time {
                    color: color-link("AudioSeekbar", "text", "disabled");
                }
            }

            & .AudioSeekbar__seeker {
                background-color: color-link("AudioSeekbar", "background", "disabled");
            }
        }
    }
</style>
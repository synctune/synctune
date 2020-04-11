<template>
    <svg 
        class="CircleLoader"
        :height="radius * 2"
        :width="radius * 2"
    >
        <circle 
            :stroke-dasharray="circumference + ' ' + circumference"
            :style="{ strokeDashoffset: stokeDashOffset }"
            :stroke-width="stroke"
            fill="transparent"
            :r="normalizedRadius"
            :cx="radius"
            :cy="radius"
        />
    </svg>
</template>

<script lang="ts">
import Vue from 'vue';

interface Props {
    radius: number;
    stroke: number;
    progress: number;
}

interface Computed {
    normalizedRadius: number;
    circumference: number;
    stokeDashOffset: number;
}

export default Vue.extend({
    props: {
        radius: {
            type: Number,
            default: 52
        },
        progress: {
            type: Number,
            default: 0
        },
        stroke: {
            type: Number,
            default: 4
        }
    },
    computed: {
        normalizedRadius() {
            const { radius, stroke }: Props = this;
            return radius - stroke / 2;
        },
        circumference() {
            const { normalizedRadius }: Computed = this;
            return normalizedRadius * 2 * Math.PI;
        },
        stokeDashOffset() {
            const { progress }: Props = this;
            const { circumference }: Computed = this;

            return circumference - progress / 100 * circumference;
        }
    }
});
</script>

<style lang="scss">
    .CircleLoader {
        & circle {
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
            transition: stroke-dashoffset 0.1s;

            stroke: color-link("CircleLoader", "accent", "primary");
        }
    }
</style>
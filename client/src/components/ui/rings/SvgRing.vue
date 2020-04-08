<template>
    <svg 
        class="SvgRing"
        :height="radius * 2"
        :width="radius * 2"
    >
        <circle 
            :stroke-dasharray="circumference + ' ' + circumference"
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
}

interface Computed {
    normalizedRadius: number;
    circumference: number;
}

export default Vue.extend({
    props: {
        radius: {
            type: Number,
            default: 52
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
        }
    }
});
</script>

<style lang="scss">
    .SvgRing {
        & circle {
            transform-origin: 50% 50%;
            stroke: color-link("SvgRing", "accent", "primary");
        }
    }
</style>
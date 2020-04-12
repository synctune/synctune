<template>
    <svg 
        :class="[
            'CircleSpinner',
            (animateColor) ? 'animate-color' : null
        ]"
        :height="radius * 2"
        :width="radius * 2"
    >
        <circle 
            ref="circleEl"
            :stroke-dasharray="circumference + ' ' + circumference"
            :style="{ strokeDashoffset: circumference }"
            :stroke-width="stroke"
            stroke-linecap="round"
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
    animateColor: boolean;
}

interface Computed {
    normalizedRadius: number;
    circumference: number;
}

interface Methods {
    setCSSVars(): void;
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
        },
        animateColor: {
            type: Boolean,
            default: false
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
    },
    mounted() {
        const { setCSSVars }: Methods = this;
        setCSSVars();
    },
    methods: {
        setCSSVars() {
            const { circumference }: Computed = this;
        
            const circleEl = this.$refs.circleEl as HTMLElement;

            circleEl.style.setProperty("--circumference", `${circumference}`);
            circleEl.style.setProperty("--inverse-circumference", `${circumference * -1}`);
            circleEl.style.setProperty("--end", `${circumference * 0.8}`);
            circleEl.style.setProperty("--start", `${circumference * -0.2}`);
        }
    },
    watch: {
        // Update CSS vars whenever the circumference changes
        circumference() {
            const { setCSSVars }: Methods = this;
            setCSSVars();
        }
    }
});
</script>

<style lang="scss">
    $spin-duration: 4.8s;
    $cycle-duration: 1.2s;
    $color-duration: 6s;

    .CircleSpinner {
        transform: rotate(-90deg);

        animation: donut-spin $spin-duration infinite linear;
        transform-origin: 50% 50%;

        & circle {
            --circumference: 0;
            --inverse-circumference: 0;
            --start: 0;
            --end: 0;

            animation: donut-cycle $cycle-duration infinite ease-in-out;

            transform: rotate(-90deg);
            transform-origin: 50% 50%;
            transition: stroke-dashoffset 0.35s;

            stroke: color-link("CircleSpinner", "accent", "primary");
        }

        &.animate-color {
            & circle {
                animation: donut-cycle $cycle-duration infinite ease-in-out, $color-duration infinite linear donut-colors;
            }
        }
    }

    // Animation keyframes

    @keyframes donut-colors {
        0% {
            stroke: color-link("CircleSpinner", "hue_rotate", "color_1");
        }
        20% {
            stroke: color-link("CircleSpinner", "hue_rotate", "color_2");
        }
        40% {
            stroke: color-link("CircleSpinner", "hue_rotate", "color_3");
        }
        60% {
            stroke: color-link("CircleSpinner", "hue_rotate", "color_4");
        }
        80% {
            stroke: color-link("CircleSpinner", "hue_rotate", "color_5");
        }
        100% {
            stroke: color-link("CircleSpinner", "hue_rotate", "color_6");
        }
    }

    @keyframes donut-spin {
        0% {
          transform: rotate(-90deg);
        }
        100% {
          transform: rotate(270deg);
        }
    }

    @keyframes donut-cycle {
        0% {
            stroke-dasharray: 0, var(--circumference);
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dasharray: var(--end), var(--circumference);
            stroke-dashoffset: var(--start);
        }
        95% {
            stroke-dasharray: var(--end), var(--circumference);
            stroke-dashoffset: var(--inverse-circumference);
        }
        100% {
            stroke-dasharray: var(--end), var(--circumference);
            stroke-dashoffset: var(--inverse-circumference);
        }
    }
</style>
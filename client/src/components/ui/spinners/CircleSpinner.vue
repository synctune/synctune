<template>
  <svg
    :class="['CircleSpinner', props.animateColor ? 'animate-color' : null]"
    :height="props.radius * 2"
    :width="props.radius * 2"
  >
    <circle
      ref="circleRef"
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset: circumference }"
      :stroke-width="props.stroke"
      stroke-linecap="round"
      fill="transparent"
      :r="normalizedRadius"
      :cx="props.radius"
      :cy="props.radius"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { assert } from "tsafe";

const props = withDefaults(
  defineProps<{
    radius?: number;
    stroke?: number;
    animateColor?: boolean;
  }>(),
  {
    radius: 52,
    stroke: 4,
    animateColor: false,
  }
);

const circleRef = ref<HTMLElement | null>(null);

const normalizedRadius = computed(() => props.radius - props.stroke / 2);
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI);

const setCSSVars = () => {
  const circleEl = circleRef.value;
  assert(circleEl !== null);

  circleEl.style.setProperty("--circumference", `${circumference.value}`);
  circleEl.style.setProperty(
    "--inverse-circumference",
    `${circumference.value * -1}`
  );
  circleEl.style.setProperty("--end", `${circumference.value * 0.8}`);
  circleEl.style.setProperty("--start", `${circumference.value * -0.2}`);
};

onMounted(() => {
  setCSSVars();
});

// Update CSS vars whenever the circumference changes
watch(circumference, () => {
  setCSSVars();
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
      animation: donut-cycle $cycle-duration infinite ease-in-out,
        $color-duration infinite linear donut-colors;
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

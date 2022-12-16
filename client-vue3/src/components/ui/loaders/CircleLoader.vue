<template>
  <svg
    class="CircleLoader"
    :height="props.radius * 2"
    :width="props.radius * 2"
  >
    <circle
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset: strokeDashOffset }"
      :stroke-width="props.stroke"
      fill="transparent"
      :r="normalizedRadius"
      :cx="props.radius"
      :cy="props.radius"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    radius?: number;
    progress?: number;
    stroke?: number;
  }>(),
  {
    radius: 52,
    progress: 0,
    stroke: 4,
  }
);

const normalizedRadius = computed(() => props.radius - props.stroke / 2);
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI);
const strokeDashOffset = computed(
  () => circumference.value - (props.progress / 100) * circumference.value
);
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

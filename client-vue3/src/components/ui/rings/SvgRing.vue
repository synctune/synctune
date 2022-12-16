<template>
  <svg class="SvgRing" :height="props.radius * 2" :width="props.radius * 2">
    <circle
      :stroke-dasharray="circumference + ' ' + circumference"
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
    stroke?: number;
  }>(),
  {
    radius: 52,
    stroke: 4,
  }
);

const normalizedRadius = computed(() => props.radius - props.stroke / 2);
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI);
</script>

<style lang="scss">
.SvgRing {
  & circle {
    transform-origin: 50% 50%;
    stroke: color-link("SvgRing", "accent", "primary");
  }
}
</style>

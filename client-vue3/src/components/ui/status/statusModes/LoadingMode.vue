<template>
  <BaseMode class="LoadingMode" :icon-size="props.iconSize">
    <template #icon>
      <DownloadIcon />
    </template>
    <template #default>
      <CircleSpinner
        class="LoadingMode__spinner"
        :radius="props.radius"
        :stroke="props.stroke"
        :animate-color="props.animateColor"
      />
    </template>
  </BaseMode>
</template>

<script setup lang="ts">
import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";
import DownloadIcon from "vue-material-design-icons/DownloadOutline.vue";

const props = withDefaults(
  defineProps<{
    // BaseMode props
    iconSize?: string;
    // CircleSpinner props
    radius?: number;
    stroke?: number;
    animateColor?: boolean;
  }>(),
  {}
);
</script>

<style lang="scss">
.LoadingMode {
  & .LoadingMode__spinner circle {
    stroke: color-link("LoadingMode", "sync_status", "loading");
  }
}
</style>

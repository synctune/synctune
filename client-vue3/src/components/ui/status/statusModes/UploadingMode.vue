<template>
  <BaseMode class="UploadingMode" :icon-size="props.iconSize">
    <template #icon>
      <DownloadIcon />
    </template>
    <template #default>
      <CircleLoader
        v-if="hasProgress"
        class="UploadingMode__loader"
        :progress="progress"
        :radius="props.radius"
        :stroke="props.stroke"
        :animate-color="props.animateColor"
      />
      <CircleSpinner
        v-else
        class="UploadingMode__loader"
        :radius="props.radius"
        :stroke="props.stroke"
        :animate-color="props.animateColor"
      />
    </template>
  </BaseMode>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import CircleLoader from "@/components/ui/loaders/CircleLoader.vue";
import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";
import DownloadIcon from "vue-material-design-icons/DownloadOutline.vue";

const props = withDefaults(
  defineProps<{
    progress?: number;
    // BaseMode props
    iconSize?: string;
    // CircleSpinner/CircleLoader props
    radius?: number;
    stroke?: number;
    animateColor?: boolean;
  }>(),
  {}
);

const hasProgress = computed(() => props.progress !== undefined);
</script>

<style lang="scss">
.UploadingMode {
  & .UploadingMode__loader circle {
    stroke: color-link("UploadingMode", "sync_status", "uploading");
  }
}
</style>

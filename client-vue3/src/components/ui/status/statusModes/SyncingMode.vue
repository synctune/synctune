<template>
  <BaseMode class="SyncingMode" :icon-size="props.iconSize">
    <template #icon>
      <SyncIcon />
    </template>
    <template #default>
      <CircleSpinner
        class="SyncingMode__spinner"
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
import SyncIcon from "vue-material-design-icons/Sync.vue";

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
.SyncingMode {
  & .SyncingMode__spinner circle {
    stroke: color-link("SyncingMode", "sync_status", "syncing");
  }
}
</style>

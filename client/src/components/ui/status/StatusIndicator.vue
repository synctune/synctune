<template>
  <div class="StatusIndicator" :style="baseStyles">
    <transition name="fade" mode="out-in">
      <ReadyMode
        v-if="syncStatusTyped == 'ready'"
        class="StatusIndicator__mode"
        :icon-size="props.iconSize"
        :radius="radius"
        :stroke="stroke"
      />
      <SyncingMode
        v-else-if="syncStatusTyped == 'syncing'"
        class="StatusIndicator__mode"
        :icon-size="props.iconSize"
        :radius="radius"
        :stroke="stroke"
      />
      <UploadingMode
        v-else-if="syncStatusTyped == 'uploading'"
        class="StatusIndicator__mode"
        :icon-size="props.iconSize"
        :radius="radius"
        :stroke="stroke"
        :progress="props.uploadProgress"
      />
      <LoadingMode
        v-else-if="syncStatusTyped == 'loading'"
        class="StatusIndicator__mode"
        :icon-size="props.iconSize"
        :radius="radius"
        :stroke="stroke"
      />
      <ErrorMode
        v-else
        class="StatusIndicator__mode"
        :icon-size="props.iconSize"
        :radius="radius"
        :stroke="stroke"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import * as Utilities from "@/utilities";
import ErrorMode from "@/components/ui/status/statusModes/ErrorMode.vue";
import ReadyMode from "@/components/ui/status/statusModes/ReadyMode.vue";
import SyncingMode from "@/components/ui/status/statusModes/SyncingMode.vue";
import UploadingMode from "@/components/ui/status/statusModes/UploadingMode.vue";
import LoadingMode from "@/components/ui/status/statusModes/LoadingMode.vue";
import type { SyncStatus } from "@/types";

const props = defineProps({
  syncStatus: {
    type: String,
    validator(val: string) {
      return ["ready", "syncing", "uploading", "loading", "error"].includes(
        val
      );
    },
    required: true,
  },
  uploadProgress: {
    type: Number,
    required: false,
  },
  size: {
    type: String,
    validator: Utilities.isCSSLength,
    default: "3rem",
  },
  iconSize: {
    type: String,
    validator: Utilities.isCSSLength,
    default: "1.8rem",
  },
});

const syncStatusTyped = computed(() => props.syncStatus as SyncStatus);

const baseStyles = computed(() => ({ width: props.size, height: props.size }));
const sizePx = computed(() => Utilities.remToPixel(props.size));
const radius = computed(() => sizePx.value / 2);
const stroke = computed(() => 2);
</script>

<style lang="scss">
.StatusIndicator {
  flex-grow: 0;
  flex-shrink: 0;

  & .StatusIndicator__mode {
    width: 100%;
    height: 100%;
  }
}

// Transition effects
@include transition-effect(fade, 0.2s);
</style>

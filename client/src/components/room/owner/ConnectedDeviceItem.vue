<template>
  <div
    :class="[
      'ConnectedDeviceItem',
      props.alternateColor ? 'alternate-color' : null,
    ]"
  >
    <StatusIndicator
      class="ConnectedDeviceItem__status"
      :sync-status="props.data.status"
      :upload-progress="props.data.uploadProgress ?? undefined"
    />

    <div class="ConnectedDeviceItem__nickname">
      {{ props.data.nickname }}
    </div>

    <MiniIconButton
      class="ConnectedDeviceItem__kick-button"
      @click="emit('kick', props.data.id)"
    >
      <CloseIcon />
    </MiniIconButton>
  </div>
</template>

<script setup lang="ts">
import type { RoomClient } from "@/types";
import CloseIcon from "vue-material-design-icons/Close.vue";
import MiniIconButton from "@/components/ui/button/MiniIconButton.vue";
import StatusIndicator from "@/components/ui/status/StatusIndicator.vue";

const props = withDefaults(
  defineProps<{
    alternateColor?: boolean;
    data: RoomClient;
  }>(),
  {
    alternateColor: false,
  }
);

const emit = defineEmits<{
  (event: "kick", clientId: string): void;
}>();
</script>

<style lang="scss">
.ConnectedDeviceItem {
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: color-link("ConnectedDeviceItem", "text", "primary");
  background-color: color-link("ConnectedDeviceItem", "background", "primary");

  padding: 1rem 1.3rem;

  & .ConnectedDeviceItem__nickname {
    width: 100%;

    flex-grow: 1;
    flex-shrink: 1;

    color: color-link("ConnectedDeviceItem", "text", "secondary");

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    font-size: 1.7rem;

    margin: 0 1rem;
  }

  &.alternate-color {
    background-color: color-link(
      "ConnectedDeviceItem",
      "background",
      "secondary"
    );
  }
}
</style>

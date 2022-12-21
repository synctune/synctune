<template>
  <ContentContainer
    :class="['ConnectedDevicesContainer', hasClients ? 'has-clients' : null]"
    base-class="ConnectedDevicesContainer__container"
    :vertical-accents="false"
  >
    <overlay-scrollbar
      v-if="hasClients"
      class="ConnectedDevicesContainer__device-list"
      :options="{
        paddingAbsolute: true,
        scrollbars: {
          autoHide: 'leave',
        },
      }"
    >
      <ConnectedDeviceItem
        v-for="(client, n) in props.clients"
        :key="client.id"
        :data="client"
        :alternate-color="!!(n % 2)"
        @kick="emit('kick', client.id)"
      />
    </overlay-scrollbar>
    <div v-else class="ConnectedDevicesContainer__no-devices">
      No connected devices
    </div>
  </ContentContainer>
</template>

<script setup lang="ts">
import type { RoomClient } from "@/types";
import ContentContainer from "@/components/ui/ContentContainer.vue";
import ConnectedDeviceItem from "@/components/room/owner/ConnectedDeviceItem.vue";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    clients: RoomClient[];
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "kick", clientId: string): void;
}>();

const hasClients = computed(() => props.clients.length > 0);
</script>

<style lang="scss">
.ConnectedDevicesContainer {
  width: 100%;

  display: flex;
  flex-direction: column;

  & .ConnectedDevicesContainer__container {
    flex-grow: 0;
    flex-shrink: 1;
    min-height: 0;

    display: flex;
    flex-direction: column;

    padding: 0.7rem 0;

    & .ConnectedDevicesContainer__device-list {
      height: 100%;

      display: flex;
      flex-direction: column;
    }

    & .ConnectedDevicesContainer__no-devices {
      text-align: center;
      color: color-link("ConnectedDevicesContainer", "text", "secondary");

      margin: 1rem 0;
    }
  }

  &:not(.has-clients) :deep(.ConnectedDevicesContainer__container) {
    justify-content: center;
  }
}
</style>

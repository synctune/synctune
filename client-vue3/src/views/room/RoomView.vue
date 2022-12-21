<template>
  <div id="Room">
    <RoomOwnerView v-if="roomStore.isOwner && roomStore.isConnected" />
    <RoomClientView v-else-if="!roomStore.isOwner && roomStore.isConnected" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import RoomOwnerView from "@/components/room/RoomOwnerView.vue";
import RoomClientView from "@/components/room/RoomClientView.vue";
import { useRoomStore } from "@/stores/room";
import { useRouter } from "vue-router";
import { useNotificationManager } from "@/managers/NotificationManager";

const router = useRouter();
const roomStore = useRoomStore();
const notificationManager = useNotificationManager();

onMounted(() => {
  if (!roomStore.isConnected) {
    // Redirect back to home page and give an error message
    router.push("/").catch(() => {});
    notificationManager.showErrorNotification("Error: not connected to a room");
    return;
  }
});
</script>

<style lang="scss">
#Room {
  padding: 0 3rem;

  height: 100%;

  @include respond(phone) {
    padding: 1rem 2rem;
  }
}
</style>

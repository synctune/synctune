<template>
  <div id="RoomConnectionHandler">
    <div id="RoomConnectionHandler__prefix-text">
      {{ prefixText }}
    </div>

    <div id="RoomConnectionHandler__room-name" class="GLOBAL-monospace-font">
      {{ roomName }}
    </div>

    <CircleSpinner
      id="RoomConnectionHandler__spinner"
      :radius="35"
      :stroke="6"
      :animate-color="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useNotificationManager } from "@/managers/NotificationManager";
import { useRoomStore } from "@/stores/room";
import { assert } from "tsafe";
import { useRoute, useRouter } from "vue-router";

import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";

const CONNECTION_MANAGER_TAG = "room-connection-handler";

type Mode = "join" | "create";

const props = withDefaults(
  defineProps<{
    mode: Mode;
  }>(),
  {}
);

const router = useRouter();
const route = useRoute();
const notificationManager = useNotificationManager();
const roomStore = useRoomStore();

const roomName = ref<string>("");

const prefixText = computed(() =>
  props.mode === "join" ? "Joining Room" : "Creating Room"
);

const clearEventListeners = () => {
  const connectionManager = roomStore.connectionManager;

  connectionManager.removeEventListenersByTag(
    "room-not-exists",
    CONNECTION_MANAGER_TAG
  );
  connectionManager.removeEventListenersByTag(
    "room-already-exists",
    CONNECTION_MANAGER_TAG
  );
  connectionManager.removeEventListenersByTag(
    "room-joined",
    CONNECTION_MANAGER_TAG
  );
  connectionManager.removeEventListenersByTag(
    "room-created",
    CONNECTION_MANAGER_TAG
  );
  connectionManager.removeEventListenersByTag("error", CONNECTION_MANAGER_TAG);
};

const onSuccess = () => {
  clearEventListeners();

  router.push(`/room`).catch(() => {});
};

const onFail = (roomName: string) => {
  if (props.mode == "join") {
    notificationManager.showErrorNotification(
      `Unable to join room '${roomName}'.`
    );
  } else {
    notificationManager.showErrorNotification(
      `Unable to create room '${roomName}'.`
    );
  }

  clearEventListeners();

  // Go back to home page
  router.push(`/`).catch(() => {});
};

const onError = () => {
  notificationManager.showErrorNotification(`An unexpected error occurred.`);

  clearEventListeners();

  // Go back to home page
  router.push(`/`).catch(() => {});
};

onMounted(() => {
  const connectionManager = roomStore.connectionManager;

  const targetRoom = route.params["id"];
  if (targetRoom !== undefined) {
    assert(!Array.isArray(targetRoom));
    roomName.value = targetRoom ? targetRoom.toUpperCase() : "";
  }

  if (roomStore.isConnected && connectionManager.room !== targetRoom) {
    notificationManager.showErrorNotification("Already connected to a room.");

    router.push("/").catch(() => {}); // Redirect to home
    return;
  }

  if (!targetRoom) {
    notificationManager.showErrorNotification(`No room name provided.`);
    router.push("/").catch(() => {}); // Redirect to home
    return;
  }

  const targetRoomSanitized = targetRoom.trim().toUpperCase();

  connectionManager.leaveRoom();

  // Join the room
  if (props.mode === "join") {
    connectionManager.joinRoom(targetRoomSanitized);

    connectionManager.addEventListener("room-not-exists", onFail);
    connectionManager.addEventListener("room-joined", onSuccess);
  }
  // Create room
  else if (props.mode === "create") {
    connectionManager.createRoom(targetRoomSanitized);

    connectionManager.addEventListener("room-already-exists", onFail);
    connectionManager.addEventListener("room-created", onSuccess);
  }

  connectionManager.addEventListener("error", onError);
});
</script>

<style lang="scss">
#RoomConnectionHandler {
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & #RoomConnectionHandler__prefix-text {
    font-size: 1.5rem;
  }

  & #RoomConnectionHandler__room-name {
    font-size: 3rem;
    font-weight: 600;
  }

  & #RoomConnectionHandler__spinner {
    margin-top: 2rem;
  }
}
</style>

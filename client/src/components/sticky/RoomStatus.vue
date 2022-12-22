<template>
  <transition name="slide-lr-abs" mode="out-in">
    <div
      class="RoomStatus__wrapper"
      v-if="roomStore.isConnected && onDisplayableRoute"
    >
      <ContentContainer
        :class="['RoomStatus', audioStore.audioLoaded ? 'audio-loaded' : null]"
        base-class="RoomStatus__container"
        :vertical-accents="true"
      >
        <ArtworkThumbnail class="RoomStatus__artwork-thumbnail" />

        <div class="RoomStatus__song-title">
          {{ trackTitleDisplay }}
        </div>

        <NextButton class="RoomStatus__to-room-button" @click="onToRoomClick" />
      </ContentContainer>
    </div>
  </transition>
</template>

<script setup lang="ts">
import ContentContainer from "@/components/ui/ContentContainer.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";
import NextButton from "@/components/ui/button/NextButton.vue";
import { useRoomStore } from "@/stores/room";
import { useAudioStore } from "@/stores/audio";
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type ConnectionManager from "@/managers/ConnectionManager";

// The route names that the room status will display itself on
const DISPLAYABLE_ROUTE_NAMES: (string | symbol)[] = ["home"];

const NO_LOADED_TRACK_TITLE_DISPLAY = "<no track currently loaded>";

const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();
const audioStore = useAudioStore();

const trackTitleDisplay = computed(() =>
  audioStore.audioLoaded
    ? audioStore.audioFileMetadata!.name
    : NO_LOADED_TRACK_TITLE_DISPLAY
);

const onDisplayableRoute = computed(() =>
  route.name ? DISPLAYABLE_ROUTE_NAMES.includes(route.name) : false
);

const onRoomLeft = () => {
  router.push("/").catch(() => {});
};

const onClientRtcJoined = (clientId: string) => {
  const connectionManager = roomStore.connectionManager;

  const TAG = `room-status-init-audio-sync-${clientId}`;

  // Sync audio file once the intial timesync is complete
  connectionManager.addEventListener(
    "clienttimesyncchanged",
    ({ clientId: syncedClientID, timesynced }) => {
      if (syncedClientID !== clientId) return;

      // If audio is playing, send the play signal to the newly connected client
      if (audioStore.isPlaying) {
        connectionManager.sendPlaySignal(
          audioStore.audioContext.currentTime - audioStore.startedAt,
          0,
          false,
          false,
          false,
          [clientId]
        );
      }

      if (timesynced && audioStore.audioFile && audioStore.audioFileMetadata) {
        connectionManager.syncAudioFile(
          audioStore.audioFile,
          audioStore.audioFileMetadata,
          false,
          [clientId]
        );

        // Clear event listeners for this client (so our listeners don't get triggered again)
        connectionManager.removeEventListenersByTag(
          "clienttimesyncchanged",
          TAG
        );
        connectionManager.removeEventListenersByTag("clientreadytoplay", TAG);
      }
    },
    TAG
  );

  connectionManager.addEventListener(
    "clientreadytoplay",
    (readyClientId) => {
      if (readyClientId !== clientId) return;
      // Clear event listeners for this client (so our listeners don't get triggered again)
      connectionManager.removeEventListenersByTag("clienttimesyncchanged", TAG);
      connectionManager.removeEventListenersByTag("clientreadytoplay", TAG);
    },
    TAG
  );
};

const onToRoomClick = () => {
  router.push("/room").catch(() => {});
};

const setupConnectionManagerListeners = (
  connectionManager: ConnectionManager
) => {
  connectionManager.addEventListener("room-left", () => {
    onRoomLeft();
  });

  connectionManager.addEventListener("client-joined", ({ clientId }) => {
    onClientRtcJoined(clientId);
  });

  connectionManager.addEventListener("client-left", ({ clientId }) => {
    const TAG = `room-status-init-audio-sync-${clientId}`;
    connectionManager.removeEventListenersByTag("clienttimesyncchanged", TAG);
    connectionManager.removeEventListenersByTag("clientreadytoplay", TAG);
  });
};

onMounted(() => {
  // TODO: why is this giving a type error and why is it expanding the type?
  setupConnectionManagerListeners(
    roomStore.connectionManager as ConnectionManager
  );
});
</script>

<style lang="scss">
$max-width: 40rem;
$artwork-thumbnail-max-width: 5rem;

.RoomStatus__wrapper {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;

  padding: 0 0.5rem 0.5rem 0.5rem;

  max-width: $max-width;
  width: 100%;

  z-index: 2;

  .RoomStatus {
    width: 100%;

    & .RoomStatus__container {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      // Override size for the artwork thumbnail
      & .RoomStatus__artwork-thumbnail {
        $note-padding: 1rem;

        max-width: $artwork-thumbnail-max-width;

        & .ArtworkThumbnail__note-icon {
          width: calc(100% - 2 * #{$note-padding});
          height: calc(100% - 2 * #{$note-padding});
        }
      }

      & .RoomStatus__song-title {
        font-size: 1.5rem;
        font-weight: 500;

        text-align: center;

        color: color-link("CurrentSongContainer", "text", "primary");
      }
    }

    &:not(.audio-loaded) {
      & .RoomStatus__container .RoomStatus__song-title {
        color: color-link("CurrentSongContainer", "text", "disabled");
      }
    }
  }
}

// Transition effects
@include transition-effect(slide-lr-abs, 0.3s, 50%);
</style>

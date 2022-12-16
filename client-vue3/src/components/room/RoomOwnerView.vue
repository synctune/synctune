<template>
  <div id="RoomOwnerView">
    <BackButton id="RoomOwnerView__back-button" @click="gotoHomePage" />

    <div id="RoomOwnerView__room-code-container">
      <div id="RoomOwnerView__room-code-title">Room Code:</div>
      <div id="RoomOwnerView__room-code" class="GLOBAL-monospace-font">
        {{ roomStore.roomName }}
      </div>
    </div>

    <div id="RoomOwnerView__room-controls">
      <UploadButton
        id="RoomOwnerView__upload-audio"
        name="room-file-input"
        accept="audio/*"
        :disabled="!roomStore.timesynced && hasClients"
        @change="onAudioFileChange"
      />

      <SyncButton
        id="RoomOwnerView__sync-button"
        size="5rem"
        icon-size="3rem"
        :syncing="!roomStore.timesynced && hasClients"
        :disabled="!hasClients"
        @click="timesyncClients"
      />
    </div>

    <div id="RoomOwnerView__connected-devices-container">
      <div
        id="RoomOwnerView__connected-devices-title"
        class="RoomOwnerView__container-title"
      >
        Connected Devices
      </div>
      <ConnectedDevicesContainer
        id="RoomOwnerView__connected-devices"
        :clients="containerClientList"
        @kick="kickClient"
      />
    </div>

    <div id="RoomOwnerView__music-controls-container">
      <div
        id="RoomOwnerView__music-controls-title"
        class="RoomOwnerView__container-title"
      >
        Music Controls
      </div>

      <MusicControlsContainer
        id="RoomOwnerView__music-controls"
        :can-play="
          audioStore.audioLoaded && (roomStore.timesynced || !hasClients)
        "
        :is-playing="audioStore.isPlaying"
        :track-title="audioTrackTitle"
        :song-length="songLength ?? undefined"
        :current-time="audioStore.currentTime"
        @play="playAudio"
        @pause="pauseAudio"
        @stop="stopAudio"
        @seek="seekAudio"
      />
    </div>

    <ButtonSecondary id="RoomOwnerView__leave-room" @click="leaveRoom">
      Leave Room
    </ButtonSecondary>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useRoomStore } from "@/stores/room";
import { useAudioStore } from "@/stores/audio";
import { AUDIO_CHUNK_SIZE } from "../../constants";
import type { RoomClient } from "@/types";
import type { AudioFileMetadata } from "@/managers/ConnectionManager";

import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import ConnectedDevicesContainer from "./owner/ConnectedDevicesContainer.vue";
import MusicControlsContainer from "@/components/room/owner/MusicControlsContainer.vue";
import UploadButton from "@/components/ui/button/UploadButton.vue";
import SyncButton from "@/components/ui/button/SyncButton.vue";
import BackButton from "@/components/ui/button/BackButton.vue";

const router = useRouter();
const roomStore = useRoomStore();
const audioStore = useAudioStore();

const audioTrackTitle = computed(() => audioStore.audioFileMetadata?.name);
const hasClients = computed(() => roomStore.connectedClients.length > 0);

const containerClientList = computed(() => {
  const numChunks = audioStore.audioFile
    ? Math.ceil(audioStore.audioFile.size / AUDIO_CHUNK_SIZE)
    : 0;

  return roomStore.connectedClients.map((clientData) => {
    const uploadProgress = audioStore.audioFile
      ? (clientData.uploadedChunks / numChunks) * 100
      : null;

    const transData: RoomClient = {
      id: clientData.id,
      nickname: clientData.nickname,
      status: clientData.state,
      uploadProgress,
    };
    return transData;
  });
});

const songLength = computed(() => {
  if (!audioStore.audioLoaded) return null;
  return audioStore.audioBuffer ? audioStore.audioBuffer.duration : null;
});

const kickClient = (clientId: string) => {
  roomStore.connectionManager.kickClient(clientId);
};

const timesyncClients = () => {
  roomStore.connectionManager.synchronizeClocks();
};

const playAudio = () => {
  roomStore.connectionManager.sendPlaySignal(
    audioStore.pausedAt,
    100,
    false,
    false,
    true
  );
};

const pauseAudio = () => {
  roomStore.connectionManager.sendPauseSignal();
};

const stopAudio = () => {
  roomStore.connectionManager.sendStopSignal();
};

const syncAudioFile = (audioFile: File) => {
  const metadata: AudioFileMetadata = {
    name: audioFile.name,
    size: audioFile.size,
    type: audioFile.type,
  };

  roomStore.connectionManager.syncAudioFile(audioFile, metadata, true);
};

const onAudioFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const audioFile = target.files ? target.files[0] : null;

  if (audioFile) {
    stopAudio();
    syncAudioFile(audioFile);
  }
};

const seekAudio = (seekTime: number) => {
  roomStore.connectionManager.sendPlaySignal(seekTime, 100, false, false, true);
};

const gotoHomePage = () => {
  router.push("/").catch(() => {});
};

const leaveRoom = () => {
  roomStore.connectionManager.leaveRoom();
};
</script>

<style lang="scss">
$max-container-width: 45rem;
$vertical-margins: 1rem;

#RoomOwnerView {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  height: 100%;

  padding: $vertical-margins;

  & > :not(:last-child) {
    margin-bottom: 1.3rem;
  }

  & #RoomOwnerView__back-button {
    position: absolute;
    top: 0;
    left: 0;

    margin-top: $vertical-margins;
  }

  & .RoomOwnerView__container-title {
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
  }

  & #RoomOwnerView__room-code-container {
    text-align: center;

    & #RoomOwnerView__room-code-title {
      font-size: 1.8rem;
    }

    & #RoomOwnerView__room-code {
      font-size: 2.3rem;
      font-weight: 700;
    }
  }

  & #RoomOwnerView__room-controls {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas: "left-side center right-side";

    width: 100%;

    & #RoomOwnerView__upload-audio {
      grid-area: center;
      justify-self: center;
      align-self: center;
    }

    & #RoomOwnerView__sync-button {
      margin-left: 2.5rem;

      @include respond(phone) {
        margin-left: 1.5rem;
      }

      grid-area: right-side;
      align-self: center;
    }
  }

  & #RoomOwnerView__connected-devices-container {
    flex-grow: 0;
    flex-shrink: 1;

    width: 100%;
    max-width: $max-container-width;

    display: flex;
    flex-direction: column;

    & #RoomOwnerView__connected-devices {
      min-height: 3rem;

      flex-grow: 0;
      flex-shrink: 1;
      min-height: 0;
    }
  }

  & #RoomOwnerView__music-controls-container {
    width: 100%;
    max-width: $max-container-width;
  }

  & #RoomOwnerView__leave-room {
    margin-bottom: 1rem;
  }
}
</style>

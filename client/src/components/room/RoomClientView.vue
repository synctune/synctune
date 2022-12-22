<template>
  <div id="RoomClientView">
    <BackButton id="RoomClientView__back-button" @click="gotoHomePage" />

    <div id="RoomClientView__room-code-container">
      <div id="RoomClientView__room-code-title">Room Code:</div>
      <div id="RoomClientView__room-code" class="GLOBAL-monospace-font">
        {{ roomStore.roomName }}
      </div>
    </div>

    <AudioVisualizerCircle
      id="RoomClientView__audio-visualizer"
      :disabled="!audioStore.isPlaying || !audioStore.audioLoaded"
      :audio-context="audioStore.audioContext"
      :audio-source="audioStore.audioSource ?? undefined"
    />

    <div id="RoomClientView__current-song-container">
      <div
        id="RoomClientView__current-song-title"
        class="RoomClientView__container-title"
      >
        Music Controls
      </div>

      <CurrentSongContainer
        id="RoomClientView__current-song"
        :is-playing="audioStore.isPlaying"
        :audio-loaded="audioStore.audioLoaded"
        :track-title="audioTrackTitle"
        @compensate-forwards="compensateForwards"
        @compensate-backwards="compensateBackwards"
      />
    </div>

    <ButtonSecondary id="RoomClientView__leave-room" @click="leaveRoom">
      Leave Room
    </ButtonSecondary>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoomStore } from "@/stores/room";
import { useAudioStore } from "@/stores/audio";
import { AUDIO_COMPENSATE_AMOUNT } from "@/constants";

import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import BackButton from "@/components/ui/button/BackButton.vue";
import CurrentSongContainer from "@/components/room/client/CurrentSongContainer.vue";
import AudioVisualizerCircle from "@/components/audio/AudioVisualizerCircle.vue";
import { useRouter } from "vue-router";

const router = useRouter();
const roomStore = useRoomStore();
const audioStore = useAudioStore();

const audioTrackTitle = computed(() => audioStore.audioFileMetadata?.name);

const gotoHomePage = () => {
  router.push("/").catch(() => {});
};

const leaveRoom = () => {
  roomStore.connectionManager.leaveRoom();
};

const compensateAudio = (compensationAmount: number) => {
  // Update total compensation
  const newTotalCompensation =
    audioStore.totalCompensation + compensationAmount;
  audioStore.setTotalCompensation(newTotalCompensation);

  // Play audio at newly compensated time
  roomStore.connectionManager.sendPlaySignal(
    audioStore.audioContext.currentTime - audioStore.startedAt,
    0,
    true,
    true,
    true
  );
};

const compensateForwards = () => {
  compensateAudio(AUDIO_COMPENSATE_AMOUNT);
};

const compensateBackwards = () => {
  compensateAudio(-1 * AUDIO_COMPENSATE_AMOUNT);
};
</script>

<style lang="scss">
$max-container-width: 45rem;
$connected-devices-min-height: 18rem;
$vertical-margins: 1rem;
$spacing-margin: 1.3rem;

#RoomClientView {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  height: 100%;

  padding: $vertical-margins;

  & > :not(:last-child) {
    margin-bottom: $spacing-margin;
  }

  & #RoomClientView__back-button {
    position: absolute;
    top: 0;
    left: 0;

    margin-top: $vertical-margins;
  }

  & .RoomClientView__container-title {
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
  }

  & #RoomClientView__audio-visualizer {
    $extra-margin: 1.3rem;
    margin: ($extra-margin) 0 ($spacing-margin + $extra-margin) 0;

    @include respond(phone) {
      $extra-margin: 0.5rem;
      margin: ($extra-margin) 0 ($spacing-margin + $extra-margin) 0;
    }
  }

  & #RoomClientView__room-code-container {
    text-align: center;

    & #RoomClientView__room-code-title {
      font-size: 1.8rem;
    }

    & #RoomClientView__room-code {
      font-size: 2.3rem;
      font-weight: 700;
    }
  }

  & #RoomClientView__current-song-container {
    width: 100%;
    max-width: $max-container-width;
  }

  & #RoomClientView__leave-room {
    margin-bottom: 1rem;
  }
}
</style>

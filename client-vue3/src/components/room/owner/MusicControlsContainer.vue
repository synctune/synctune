<template>
  <ContentContainer
    :class="['MusicControlsContainer', trackIsLoaded ? 'track-loaded' : null]"
    base-class="MusicControlsContainer__container"
    :vertical-accents="false"
  >
    <ArtworkThumbnail class="MusicControlsContainer__artwork-thumbnail" />

    <div class="MusicControlsContainer__song-title">
      {{ trackTitleDisplay }}
    </div>

    <div class="MusicControlsContainer__controls">
      <CircularIconButton
        class="MusicControlsContainer__pause-button"
        @click="emit('pause', $event)"
        size="4rem"
        icon-size="2.5rem"
        :disabled="!isPlaying || !canPlay"
      >
        <PauseIcon />
      </CircularIconButton>

      <CircularIconButton
        class="MusicControlsContainer__play-button"
        @click="emit('play', $event)"
        size="6rem"
        icon-size="4.5rem"
        :disabled="isPlaying || !canPlay"
      >
        <PlayIcon />
      </CircularIconButton>

      <CircularIconButton
        class="MusicControlsContainer__stop-button"
        @click="emit('stop', $event)"
        size="4rem"
        icon-size="2.5rem"
        :disabled="!isPlaying || !canPlay"
      >
        <StopIcon />
      </CircularIconButton>
    </div>

    <AudioSeekbar
      class="MusicControlsContainer__audio-seekbar"
      :song-length="songLength"
      :current-time="currentTime"
      @seek="emit('seek', $event)"
    />
  </ContentContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PlayIcon from "vue-material-design-icons/Play.vue";
import PauseIcon from "vue-material-design-icons/Pause.vue";
import StopIcon from "vue-material-design-icons/Stop.vue";
import ContentContainer from "@/components/ui/ContentContainer.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";
import CircularIconButton from "@/components/ui/button/CircularIconButton.vue";
import AudioSeekbar from "@/components/audio/AudioSeekbar.vue";

const NO_LOADED_TRACK_TITLE_DISPLAY = "<no track currently loaded>";

const props = withDefaults(
  defineProps<{
    trackTitle?: string;
    isPlaying?: boolean;
    canPlay?: boolean;
    songLength?: number;
    currentTime?: number;
  }>(),
  {
    isPlaying: false,
    canPlay: false,
    currentTime: 0,
  }
);

const emit = defineEmits<{
  (event: "play", e: MouseEvent): void;
  (event: "pause", e: MouseEvent): void;
  (event: "stop", e: MouseEvent): void;
  (event: "seek", position: number): void;
}>();

const trackTitleDisplay = computed(() =>
  props.trackTitle ? props.trackTitle : NO_LOADED_TRACK_TITLE_DISPLAY
);
const trackIsLoaded = computed(() => props.trackTitle !== undefined);
</script>

<style lang="scss">
.MusicControlsContainer {
  width: 100%;

  & .MusicControlsContainer__container {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 1rem 0;

    & > *:not(:last-child) {
      margin-bottom: 1rem;
    }

    & .MusicControlsContainer__song-title {
      font-size: 1.8rem;
      font-weight: 500;

      text-align: center;

      color: color-link("MusicControlsContainer", "text", "primary");
    }

    & .MusicControlsContainer__controls {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;

      & > *:not(:last-child) {
        margin-right: 1rem;
      }
    }
  }

  &:not(.track-loaded) {
    & .MusicControlsContainer__song-title {
      color: color-link("MusicControlsContainer", "text", "disabled");
    }
  }
}
</style>

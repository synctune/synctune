<template>
  <div class="ArtworkThumbnail">
    <div class="ArtworkThumbnail__container">
      <div class="ArtworkThumbnail__note-icon" :style="noteIconStyles"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import NoteImage from "@/assets/note.png";

const noteIconStyles = computed(() => ({
  // Source: https://stackoverflow.com/a/67744676
  backgroundImage: `url(${NoteImage})`,
}));
</script>

<style lang="scss">
$max-size: 14rem;
$note-padding: 2rem;

.ArtworkThumbnail {
  width: 100%;
  max-width: $max-size;

  & .ArtworkThumbnail__container {
    background: color-link("ArtworkThumbnail", "gradient", "start");
    background: linear-gradient(
      135deg,
      color-link("ArtworkThumbnail", "gradient", "start") 0%,
      color-link("ArtworkThumbnail", "gradient", "end") 100%
    );

    border-radius: 10px;

    position: relative;

    // For 1:1 aspect-ratio
    width: 100%;
    padding-top: 100%;

    & .ArtworkThumbnail__note-icon {
      position: absolute;
      left: 50%;
      top: 50%;

      transform: translate(-50%, -50%);

      width: calc(100% - 2 * #{$note-padding});
      height: calc(100% - 2 * #{$note-padding});

      background-size: cover;

      opacity: 0.9;

      z-index: 10;
    }
  }

  @include respond(phone) {
    $max-size: 12rem;
    max-width: $max-size;
  }
}
</style>

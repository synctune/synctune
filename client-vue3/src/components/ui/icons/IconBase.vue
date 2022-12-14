<template>
  <div class="BaseIcon" :style="styles">
    <!-- TODO: remove -->
    <!-- <component
      class="BaseIcon__container"
      @click="$emit('click', $event)"
      :is="iconNameNormalized"
    ></component> -->
    <slot class="BaseIcon__container" @click="$emit('click', $event)"></slot>
  </div>
</template>

<script setup lang="ts">
import * as Utilities from "@/utilities";
import { computed, type StyleValue } from "vue";

const props = defineProps({
  size: {
    type: String,
    validator: Utilities.isCSSLength,
    default: "3rem",
  },
});

const styles = computed<StyleValue>(() => ({
  height: props.size,
  width: props.size,
}));
</script>

<style lang="scss">
.BaseIcon {
  display: flex;

  & .BaseIcon__container {
    width: 100%;
    height: 100%;
  }

  & svg {
    display: block;

    width: 100%;
    height: 100%;
  }
}
</style>

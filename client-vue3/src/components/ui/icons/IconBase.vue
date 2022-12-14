<template>
  <div class="IconBase" :style="styles">
    <slot @click="emit('click', $event)"></slot>
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

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();

const styles = computed<StyleValue>(() => ({
  height: props.size,
  width: props.size,
}));
</script>

<style lang="scss">
.IconBase {
  display: flex;

  & svg {
    display: block;

    width: 100%;
    height: 100%;
  }
}
</style>

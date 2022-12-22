<template>
  <div class="IconBase" :style="styles" @click="emit('click', $event)">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from "vue";
import * as Validators from "@/validators";

const props = defineProps({
  size: {
    type: String,
    validator: Validators.CSSLength,
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

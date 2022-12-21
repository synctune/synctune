<template>
  <div
    :class="['CircularButton', props.disabled ? 'disabled' : null]"
    :style="baseStyles"
    @click="onClick"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import { computed } from "vue";
const props = defineProps({
  size: {
    type: String,
    validator: Validators.CSSLength,
    default: "4rem",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();

const baseStyles = computed(() => ({ width: props.size, height: props.size }));

const onClick = (e: MouseEvent) => {
  if (props.disabled) {
    e.preventDefault();
    return;
  }

  emit("click", e);
};
</script>

<style lang="scss">
$size: 3rem;
$outline-thickness: 3px;
$anim-time: 0.3s;

.CircularButton {
  flex-grow: 0;
  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: $size;
  height: $size;

  margin: div($size, 10);

  color: color-link("CircularButton", "text", "primary");

  background-color: color-link("CircularButton", "background", "primary");

  box-shadow: 0 0 2px $outline-thickness
    color-link("CircularButton", "accent", "primary");
  border-radius: 50%;

  cursor: pointer;

  transition: box-shadow $anim-time, color $anim-time,
    background-color $anim-time;

  &.disabled {
    color: color-link("CircularButton", "text", "disabled");
    background-color: color-link("CircularButton", "background", "disabled");
    box-shadow: 0 0 2px $outline-thickness
      color-link("CircularButton", "accent", "primary", 0.5);

    pointer-events: none;
  }

  &:hover:not(.disabled) {
    color: color-link("CircularButton", "text", "secondary");
    background-color: color-link("CircularButton", "background", "secondary");
    box-shadow: 0 0 2px $outline-thickness
      color-link("CircularButton", "accent", "secondary");
  }

  &:active:not(.disabled) {
    color: color-link("CircularButton", "text", "tertiary");
    box-shadow: 0 0 2px $outline-thickness
      color-link("CircularButton", "selected", "primary");
  }
}
</style>

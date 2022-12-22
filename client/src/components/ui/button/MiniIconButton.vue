<template>
  <div
    :class="['MiniIconButton', props.disabled ? 'disabled' : null]"
    :style="baseStyles"
    @click="onClick"
  >
    <IconBase class="MiniIconButton__icon" :size="props.iconSize">
      <slot></slot>
    </IconBase>
  </div>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import { computed } from "vue";
import IconBase from "@/components/ui/icons/IconBase.vue";

const props = defineProps({
  size: {
    type: String,
    validator: Validators.CSSLength,
    default: "2rem",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  iconSize: {
    type: String,
    validator: Validators.CSSLength,
    default: "1.8rem",
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
$outline-thickness: 1px;
$anim-time: 0.3s;

.MiniIconButton {
  flex-grow: 0;
  flex-shrink: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  width: $size;
  height: $size;

  margin: div($size, 10);

  color: color-link("MiniIconButton", "text", "primary");

  box-shadow: 0 0 0 $outline-thickness
    color-link("MiniIconButton", "accent", "primary");
  border-radius: 50%;

  cursor: pointer;

  transition: box-shadow $anim-time, color $anim-time;

  & .MiniIconButton__icon {
    width: 100%;
    height: 100%;
  }

  &.disabled {
    color: color-link("MiniIconButton", "text", "disabled");
    box-shadow: 0 0 0 $outline-thickness
      color-link("MiniIconButton", "accent", "primary", 0.5);

    pointer-events: none;
  }

  &:hover:not(.disabled) {
    color: color-link("MiniIconButton", "text", "secondary");
    box-shadow: 0 0 0 $outline-thickness
      color-link("MiniIconButton", "accent", "secondary");
  }

  &:active:not(.disabled) {
    color: color-link("MiniIconButton", "text", "tertiary");
    box-shadow: 0 0 0 $outline-thickness
      color-link("MiniIconButton", "selected", "primary");
  }
}
</style>

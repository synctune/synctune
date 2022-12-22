<template>
  <CircularButton
    class="CircularIconButton"
    @click="emit('click', $event)"
    :size="props.size"
    :disabled="props.disabled"
  >
    <IconBase class="CircularIconButton__icon" :size="props.iconSize">
      <slot></slot>
    </IconBase>
  </CircularButton>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";

const props = defineProps({
  iconSize: {
    type: String,
    validator: Validators.CSSLength,
    default: "3rem",
  },
  // CircularButton props
  size: {
    type: String,
  },
  disabled: {
    type: Boolean,
  },
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();
</script>

<style lang="scss">
.CircularIconButton {
  display: flex;
  justify-content: center;
  align-items: center;

  & .CircularIconButton__icon {
    width: 100%;
    height: 100%;
  }
}
</style>

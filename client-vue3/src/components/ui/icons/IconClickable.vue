<template>
  <IconBase
    :class="['IconClickable', disabled ? 'disabled' : '']"
    v-bind="$attrs"
    @click="onClick"
  >
    <slot></slot>
  </IconBase>
</template>

<script setup lang="ts">
import IconBase from "@/components/ui/icons/IconBase.vue";
import { defineEmits } from "vue";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["click"]);

const onClick = (e: MouseEvent) => {
  if (props.disabled) {
    e.preventDefault();
    return;
  }

  emit("click", e);
};
</script>

<style lang="scss">
.IconClickable {
  $duration: 0.15s;

  color: color-link("GLOBAL", "text", "primary");
  cursor: pointer;

  transition: color $duration;

  & i {
    transition: color $duration;
  }

  &:hover {
    color: color-link("GLOBAL", "text", "tertiary");
  }

  &.disabled {
    cursor: inherit;

    color: color-link("GLOBAL", "text", "disabled");

    &:hover {
      color: color-link("GLOBAL", "text", "disabled");
    }
  }
}
</style>

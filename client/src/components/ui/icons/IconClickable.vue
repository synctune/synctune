<template>
  <IconBase
    :class="['IconClickable', props.disabled ? 'disabled' : '']"
    @click="onClick"
    :size="props.size"
  >
    <slot></slot>
  </IconBase>
</template>

<script setup lang="ts">
import IconBase from "@/components/ui/icons/IconBase.vue";
import * as Validators from "@/validators";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    validator: Validators.CSSLength,
    default: "3rem",
  },
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();

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

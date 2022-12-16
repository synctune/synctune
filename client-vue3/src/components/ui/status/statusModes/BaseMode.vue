<template>
  <div class="BaseMode">
    <IconBase class="BaseMode__icon" :size="props.iconSize">
      <slot name="icon"></slot>
    </IconBase>
    <div class="BaseMode__outline">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import IconBase from "@/components/ui/icons/IconBase.vue";

const props = defineProps({
  iconSize: {
    type: String,
    validator: Validators.CSSLength,
    default: "1.8rem",
  },
});
</script>

<style lang="scss">
.BaseMode {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-radius: 50%;

  & .BaseMode__icon {
    position: absolute;
    left: 50%;
    top: 50%;

    transform: translate(-50%, -50%);
  }

  & .BaseMode__outline {
    width: 100%;
    height: 100%;
  }
}
</style>

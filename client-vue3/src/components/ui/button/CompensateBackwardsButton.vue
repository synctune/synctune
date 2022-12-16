<template>
  <CircularButton
    class="CompensateBackwardsButton"
    :size="props.size"
    :disabled="props.disabled"
    @click="emit('click', $event)"
  >
    <div class="CompensateBackwardsButton__container">
      <IconBase
        class="CompensateBackwardsButton__minus-icon"
        :size="props.secondaryIconSize"
      >
        <MinusIcon />
      </IconBase>

      <IconBase
        class="CompensateBackwardsButton__undo-icon"
        :size="props.primaryIconSize"
      >
        <UndoIcon />
      </IconBase>
    </div>
  </CircularButton>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";

import MinusIcon from "vue-material-design-icons/WindowMinimize.vue";
import UndoIcon from "vue-material-design-icons/Undo.vue";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    validator: Validators.CSSLength,
    default: "4rem",
  },
  primaryIconSize: {
    type: String,
    validator: Validators.CSSLength,
    default: "2rem",
  },
  secondaryIconSize: {
    type: String,
    validator: Validators.CSSLength,
    default: "0.7rem",
  },
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();
</script>

<style lang="scss">
.CompensateBackwardsButton {
  & .CompensateBackwardsButton__container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
</style>

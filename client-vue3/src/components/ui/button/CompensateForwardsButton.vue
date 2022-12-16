<template>
  <CircularButton
    class="CompensateForwardsButton"
    :size="props.size"
    :disabled="props.disabled"
    @click="emit('click', $event)"
  >
    <div class="CompensateForwardsButton__container">
      <IconBase
        class="CompensateForwardsButton__redo-icon"
        :size="props.primaryIconSize"
      >
        <RedoIcon />
      </IconBase>

      <IconBase
        class="CompensateForwardsButton__plus-icon"
        :size="props.secondaryIconSize"
      >
        <PlusIcon />
      </IconBase>
    </div>
  </CircularButton>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";

import PlusIcon from "vue-material-design-icons/Plus.vue";
import RedoIcon from "vue-material-design-icons/Redo.vue";

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
.CompensateForwardsButton {
  & .CompensateForwardsButton__container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
}
</style>

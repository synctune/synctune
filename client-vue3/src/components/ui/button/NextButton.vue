<template>
  <IconClickable
    class="NextButton"
    :size="props.size"
    :disabled="props.disabled"
    @click="emit('click', $event)"
  >
    <NextIcon />
  </IconClickable>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import IconClickable from "@/components/ui/icons/IconClickable.vue";
import NextIcon from "vue-material-design-icons/ChevronRight.vue";

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
</script>

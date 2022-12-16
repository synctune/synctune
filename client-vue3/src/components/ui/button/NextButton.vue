<template>
  <IconClickable
    class="NextButton"
    :size="size"
    v-bind="$attrs"
    icon-name="next-icon"
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
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();
</script>

<template>
  <IconClickable
    class="BackButton"
    :size="props.size"
    @click="emit('click', $event)"
  >
    <BackIcon />
  </IconClickable>
</template>

<script setup lang="ts">
import IconClickable from "@/components/ui/icons/IconClickable.vue";
import BackIcon from "vue-material-design-icons/ChevronLeft.vue";
import * as Validators from "@/validators";

const props = defineProps({
  size: {
    type: String,
    validator: Validators.CSSLength,
    default: "4rem",
  },
});

const emit = defineEmits<{ (event: "click", e: MouseEvent): void }>();
</script>

<template>
  <!-- Router-link -->
  <RouterLink
    v-if="useRouterLink"
    :class="['Button', { disabled: disabled }]"
    :to="to!"
    :custom="true"
  >
    <component v-bind="$attrs" :is="tag">
      <a :style="widthConstraintStyles" @click="onClick">
        <slot></slot>
      </a>
    </component>
  </RouterLink>
  <!-- Custom component -->
  <component
    v-else
    v-bind="$attrs"
    :is="tag"
    :class="['Button', { disabled: disabled }]"
  >
    <a :href="href" :style="widthConstraintStyles" @click="onClick">
      <slot></slot>
    </a>
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import * as Validators from "@/validators";
import { computed } from "vue";

const props = defineProps({
  minWidth: {
    type: String,
    validator: Validators.CSSLength,
    default: "8rem",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  to: {
    type: String,
  },
  href: {
    type: String,
  },
  tag: {
    type: String,
    default: "div",
  },
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();

const useRouterLink = computed(() => !!props.to);
const widthConstraintStyles = computed(() => ({ minWidth: props.minWidth }));

const onClick = (e: MouseEvent) => {
  if (props.disabled) {
    e.preventDefault();
    return;
  }
  emit("click", e);
};
</script>

<style lang="scss">
// TODO: implement
</style>

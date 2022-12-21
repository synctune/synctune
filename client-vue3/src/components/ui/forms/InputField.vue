<template>
  <input
    class="InputField"
    v-bind="$attrs"
    :type="props.type"
    :disabled="props.disabled"
    :value="props.value"
    @input="updateValue"
    @change="updateValue"
    @blur="emit('blur')"
  />
</template>

<script setup lang="ts">
type SupportedInputTypes = "url" | "text" | "password" | "email" | "search";

const props = withDefaults(
  defineProps<{
    type?: SupportedInputTypes;
    disabled?: boolean;
    // v-model passthrough stuff
    // Reference on how to setup v-model passthrough with Vue 3
    // https://serversideup.net/custom-component-v-model-attribute-with-vue-3/
    value: string;
  }>(),
  {
    type: "text",
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: "update:value", value: string): void;
  (event: "blur"): void;
}>();

const updateValue = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:value", target.value);
};
</script>

<style lang="scss">
.InputField {
  $transition-time: 0.5s;
  $blur-amount: 7px;

  font-size: 1.6rem;
  padding: 0.8rem;
  outline: none;

  border-radius: 0.5rem;

  color: color-link("InputField", "text", "primary");
  background-color: color-link("InputField", "background", "primary");

  border: 0.1rem solid color-link("InputField", "accent", "secondary", 0);
  box-shadow: 0px 2px $blur-amount 0px rgba(0, 0, 0, 0.2);

  transition: background-color $transition-time, box-shadow $transition-time,
    border $transition-time, color $transition-time;

  &:focus {
    border: 0.1rem solid color-link("InputField", "accent", "secondary", 1);
    box-shadow: 0px 2px $blur-amount 0px
      color-link("InputField", "accent", "primary", 0.4);
  }

  &:disabled {
    color: color-link("InputField", "text", "disabled");
    background-color: color-link("InputField", "background", "disabled");
  }
}
</style>

<template>
  <div class="ButtonInputHybrid">
    <ButtonPrimary
      class="ButtonInputHybrid__button"
      @click="onButtonClick"
      :disabled="props.buttonDisabled"
      disabled-overlay-class="ButtonInputHybrid__button-disabled-overlay"
    >
      <slot name="hybrid-button"></slot>
    </ButtonPrimary>

    <InputField
      :class="[
        'ButtonInputHybrid__input',
        hasValue ? 'GLOBAL-monospace-font' : null,
      ]"
      :placeholder="props.inputPlaceholder"
      :disabled="props.inputDisabled"
      :value="props.value"
      @input="updateInputValue"
      @blur="emit('blur')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ButtonPrimary from "@/components/ui/button/ButtonPrimary.vue";
import InputField from "@/components/ui/forms/InputField.vue";

const props = withDefaults(
  defineProps<{
    buttonDisabled?: boolean;
    inputDisabled?: boolean;
    inputPlaceholder?: string;
    // v-model passthrough stuff
    // Reference on how to setup v-model passthrough with Vue 3
    // https://serversideup.net/custom-component-v-model-attribute-with-vue-3/
    value: string;
  }>(),
  {
    buttonDisabled: false,
    inputDisabled: false,
    inputPlaceholder: "",
  }
);

const emit = defineEmits<{
  (event: "blur"): void;
  (event: "button-click", e: MouseEvent): void;
  (event: "update:value", value: string): void;
}>();

const hasValue = computed(() => !!props.value);

const onButtonClick = (e: MouseEvent) => {
  if (props.buttonDisabled) {
    e.preventDefault();
    return;
  }
  emit("button-click", e);
};

const updateInputValue = (value: any) => {
  emit("update:value", value);
};
</script>

<style lang="scss">
.ButtonInputHybrid {
  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 23rem;

  & .ButtonInputHybrid__button {
    border-radius: 0.5rem 0.5rem 0 0;

    & .ButtonInputHybrid__button-disabled-overlay {
      border-radius: 0.5rem 0.5rem 0 0;
    }
  }

  & .ButtonInputHybrid__input {
    text-align: center;

    border-radius: 0 0 0.5rem 0.5rem;

    font-size: 1.6rem;
    line-height: 1.8rem;

    &:focus {
      border-top: 0.1rem solid
        color-link("InputField", "accent", "secondary", 0);
    }

    &.GLOBAL-monospace-font {
      font-size: 1.55rem;
      letter-spacing: 0.2rem;
    }
  }
}
</style>

<template>
  <ButtonBase
    class="ButtonPrimary"
    tag="button"
    @click="emit('click', $event)"
    :min-width="props.minWidth"
    :disabled="props.disabled"
    :to="props.to"
    :href="props.href"
  >
    <div
      :class="['ButtonPrimary__disabled-overlay', props.disabledOverlayClass]"
      :style="props.disabledOverlayStyle"
      :id="props.disabledOverlayId"
    ></div>
    <slot></slot>
  </ButtonBase>
</template>

<script setup lang="ts">
import type { StyleValue } from "vue";
import ButtonBase from "@/components/ui/button/ButtonBase.vue";

const props = withDefaults(
  defineProps<{
    disabledOverlayClass?: string;
    disabledOverlayStyle?: StyleValue;
    disabledOverlayId?: string;
    // ButtonBase props
    minWidth?: string;
    disabled?: boolean;
    to?: string;
    href?: string;
  }>(),
  {}
);

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();
</script>

<style lang="scss">
.ButtonPrimary {
  $hover-duration: 0.7s;
  $select-duration: 0.5s;
  $radius-amount: 0.5rem;

  position: relative;

  background: color-link("ButtonPrimary", "gradient", "start");
  background: linear-gradient(
    90deg,
    color-link("ButtonPrimary", "gradient", "start") 0%,
    color-link("ButtonPrimary", "gradient", "end") 100%
  );

  color: color-link("ButtonPrimary", "text_inverted", "primary");

  border-radius: $radius-amount;

  font-size: 1.7rem;

  z-index: 0;

  box-shadow: 0px 4px 6px 0px
    color-link("ButtonPrimary", "gradient", "end", 0.4);

  transition: opacity $hover-duration, box-shadow $hover-duration;

  & a {
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 1rem 5rem 1rem 5rem;
  }

  &::before {
    content: "";
    border-radius: inherit;
    display: block;

    background: color-link("ButtonPrimary", "gradient", "end");
    background: linear-gradient(
      90deg,
      color-link("ButtonPrimary", "gradient", "end") 0%,
      color-link("ButtonPrimary", "gradient", "start") 100%
    );

    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;

    opacity: 0;

    z-index: -1;

    transition: opacity $hover-duration;
  }

  &::after {
    content: "";
    border-radius: inherit;
    display: block;

    background: color-link("ButtonPrimary", "gradient_selected", "start");
    background: linear-gradient(
      90deg,
      color-link("ButtonPrimary", "gradient_selected", "start") 0%,
      color-link("ButtonPrimary", "gradient_selected", "end")
    );

    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;

    opacity: 0;

    z-index: -1;

    transition: opacity $select-duration;
  }

  & .ButtonPrimary__disabled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;

    background: color-link("ButtonPrimary", "gradient_disabled", "start");
    background: linear-gradient(
      90deg,
      color-link("ButtonPrimary", "gradient_disabled", "start") 0%,
      color-link("ButtonPrimary", "gradient_disabled", "end") 100%
    );

    border-radius: $radius-amount;

    pointer-events: none;

    opacity: 0;

    z-index: -1;

    transition: opacity $select-duration;
  }

  &.disabled {
    & .ButtonPrimary__disabled-overlay {
      opacity: 1;
    }
  }

  &:hover:not(.disabled) {
    &::before {
      opacity: 1;
    }
  }

  &:active:not(.disabled) {
    box-shadow: 0px 4px 6px 0px
      color-link("ButtonPrimary", "gradient_selected", "end", 0.4);

    &::before {
      opacity: 0;
    }

    &::after {
      opacity: 1;
    }
  }
}
</style>

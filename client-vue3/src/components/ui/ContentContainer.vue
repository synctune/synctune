<template>
  <div
    :class="[
      'ContentContainer',
      props.verticalAccents ? 'vertical-accents' : 'horizontal-accents',
    ]"
  >
    <div
      :class="['ContentContainer__accent', props.accentClass]"
      :style="props.accentStyle"
      :id="props.accentId"
    ></div>

    <div
      :class="['ContentContainer__container', props.baseClass]"
      :style="props.baseStyle"
      :id="props.baseId"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StyleValue } from "vue";

const props = withDefaults(
  defineProps<{
    verticalAccents?: boolean;
    baseClass?: string;
    baseStyle?: StyleValue;
    baseId?: string;
    accentClass?: string;
    accentStyle?: StyleValue;
    accentId?: string;
  }>(),
  {}
);
</script>

<style lang="scss">
$radius-amount: 0.7rem;

.ContentContainer {
  $accent-size: 0.7rem;
  $radius-amount: 0.7rem;
  $padding-amount: 0.5rem;
  $padding-amount-sides: 0.5rem;

  position: relative;
  display: flex;
  flex-direction: column;

  border-radius: $radius-amount;
  box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.25);

  z-index: 1;

  display: inline-block;

  & .ContentContainer__container {
    flex-grow: 1;
    flex-shrink: 1;

    background-color: color-link("ContentContainer", "background", "primary");
    border-radius: $radius-amount;
    padding: $padding-amount $padding-amount-sides $padding-amount
      $padding-amount-sides;
  }

  & .ContentContainer__accent {
    background-color: color-link("ContentContainer", "accent", "primary");
    border-radius: $radius-amount;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: -1;
  }

  &.vertical-accents {
    & .ContentContainer__container {
      margin: 0 $accent-size 0 $accent-size;
      height: 100%;
    }
  }

  &.horizontal-accents {
    & .ContentContainer__container {
      margin: $accent-size 0 $accent-size 0;
      height: calc(100% - 2 * #{$accent-size});
    }
  }
}
</style>

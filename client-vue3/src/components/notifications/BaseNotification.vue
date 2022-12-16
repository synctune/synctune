<template>
  <div class="BaseNotification">
    <div
      :class="['BaseNotification__accent', accentClass]"
      :style="accentStyle"
      :id="accentId"
    ></div>

    <div
      :class="['BaseNotification__base', baseClass]"
      :style="baseStyle"
      :id="baseId"
    >
      <IconClickable
        :class="['BaseNotification__close', closeClass]"
        :style="[closeStyle]"
        :id="[closeId]"
        size="1.7rem"
        @click="props.notificationScope.close"
      >
        <CloseIcon />
      </IconClickable>

      <div
        :class="['BaseNotification__title', titleClass]"
        :style="titleStyle"
        :id="titleId"
      >
        {{ props.notificationScope.item.title }}
      </div>

      <div
        :class="['BaseNotification__text', textClass]"
        :style="textStyle"
        :id="textId"
      >
        {{ props.notificationScope.item.text }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconClickable from "@/components/ui/icons/IconClickable.vue";
import CloseIcon from "vue-material-design-icons/Close.vue";
import type { NotificationsSlotScope } from "@kyvg/vue3-notification";
import type { StyleValue } from "vue";

const props = withDefaults(
  defineProps<{
    // Passed in from Vue-Notifications
    notificationScope: NotificationsSlotScope;
    baseClass?: string;
    baseStyle?: StyleValue;
    baseId?: string;
    accentClass?: string;
    accentStyle?: StyleValue;
    accentId?: string;
    titleClass?: string;
    titleStyle?: StyleValue;
    titleId?: string;
    textClass?: string;
    textStyle?: StyleValue;
    textId?: string;
    closeClass?: string;
    closeStyle?: StyleValue;
    closeId?: string;
  }>(),
  {}
);
</script>

<style lang="scss">
$width: 330px;

// Override the width styles that the library puts in
// b/c by default the notification does not shrink when the screen is too small
.vue-notification-group {
  max-width: $width !important;
  width: 100% !important;
}

.BaseNotification {
  $accent-size: 0.5rem;
  $radius-amount: 0.3rem;
  $padding-amount: 0.5rem;
  $padding-amount-sides: 0.5rem;

  position: relative;

  border-radius: $radius-amount;

  z-index: 1;

  margin: 0.52rem 0.5rem;

  box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.25);

  & .BaseNotification__accent {
    background-color: color-link("GLOBAL", "accent", "primary");
    border-radius: $radius-amount;

    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    z-index: -1;
  }

  & .BaseNotification__base {
    position: relative;

    display: flex;
    flex-direction: row;
    align-items: center;

    // Note: this should be overridden by the components that use it
    background-color: color-link("GLOBAL", "background", "secondary");

    border-radius: $radius-amount;

    margin: 0 $accent-size 0 $accent-size;

    padding: 1.5rem 2.5rem 1.5rem 1rem;

    & .BaseNotification__close {
      position: absolute;
      top: 0;
      right: 0;

      margin: 0.2rem;
    }

    & .BaseNotification__icon {
      margin-right: 0.5rem;
    }

    & .BaseNotification__title {
      font-weight: bold;
      margin-right: 0.4rem;
    }

    & .BaseNotification__text {
      font-size: 1.5rem;
    }
  }
}

@include transition-effect(slide-rr, 0.3s);
</style>

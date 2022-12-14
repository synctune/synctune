<template>
  <BaseNotification
    base-class="ErrorNotification"
    accent-class="ErrorNotification__accent"
    close-class="ErrorNotification__close"
    title-class="ErrorNotification__title"
    text-class="ErrorNotification__text"
    :notification-scope="props.notificationScope"
  />
</template>

<script setup lang="ts">
import BaseNotification from "@/components/notifications/BaseNotification.vue";
import type { NotificationsSlotScope } from "@kyvg/vue3-notification";

const props = defineProps<{
  // Passed in from Vue-Notifications
  notificationScope: NotificationsSlotScope;
}>();
</script>

<style lang="scss">
.ErrorNotification.ErrorNotification {
  background-color: color-link("ErrorNotification", "error", "background");

  & .ErrorNotification__text {
    color: color-link("ErrorNotification", "error", "text");
  }
}

.ErrorNotification__accent.ErrorNotification__accent {
  background-color: color-link("ErrorNotification", "error", "accent");
}
</style>

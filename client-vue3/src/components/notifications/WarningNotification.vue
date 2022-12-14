<template>
  <BaseNotification
    base-class="WarningNotification"
    accent-class="WarningNotification__accent"
    close-class="WarningNotification__close"
    title-class="WarningNotification__title"
    text-class="WarningNotification__text"
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
.WarningNotification.WarningNotification {
  background-color: color-link("WarningNotification", "warning", "background");

  & .WarningNotification__text {
    color: color-link("WarningNotification", "warning", "text");
  }
}

.WarningNotification__accent.WarningNotification__accent {
  background-color: color-link("WarningNotification", "warning", "accent");
}
</style>

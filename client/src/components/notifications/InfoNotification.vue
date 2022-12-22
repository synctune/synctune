<template>
  <BaseNotification
    base-class="InfoNotification"
    accent-class="InfoNotification__accent"
    close-class="InfoNotification__close"
    title-class="InfoNotification__title"
    text-class="InfoNotification__text"
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
.InfoNotification.InfoNotification {
  background-color: color-link("InfoNotification", "info", "background");

  & .InfoNotification__text {
    color: color-link("InfoNotification", "info", "text");
  }
}

.InfoNotification__accent.InfoNotification__accent {
  background-color: color-link("InfoNotification", "info", "accent");
}
</style>

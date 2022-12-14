<template>
  <BaseNotification
    base-class="SuccessNotification"
    accent-class="SuccessNotification__accent"
    close-class="SuccessNotification__close"
    title-class="SuccessNotification__title"
    text-class="SuccessNotification__text"
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
.SuccessNotification.SuccessNotification {
  background-color: color-link("SuccessNotification", "success", "background");

  & .SuccessNotification__text {
    color: color-link("SuccessNotification", "success", "text");
  }
}

.SuccessNotification__accent.SuccessNotification__accent {
  background-color: color-link("SuccessNotification", "success", "accent");
}
</style>

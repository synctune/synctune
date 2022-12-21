<template>
  <div class="NotificationRegister">
    <!-- TODO: get some typing for this global component -->
    <notifications
      position="top right"
      :group="NOTIFICATION_GROUP"
      animation-name="slide-rr"
      v-bind="$attrs"
    >
      <!-- This toggle system is unfortunately needed due to how Vue-Notifications works -->
      <template v-slot:body="notificationScope: NotificationsSlotScope">
        <ErrorNotification
          v-if="notificationScope.item.type == 'error'"
          :notification-scope="notificationScope"
        />
        <WarningNotification
          v-else-if="notificationScope.item.type == 'warning'"
          :notification-scope="notificationScope"
        />
        <SuccessNotification
          v-else-if="notificationScope.item.type == 'success'"
          :notification-scope="notificationScope"
        />
        <InfoNotification v-else :notification-scope="notificationScope" />
      </template>
    </notifications>
  </div>
</template>

<script setup lang="ts">
import { NOTIFICATION_GROUP } from "@/constants";
import ErrorNotification from "@/components/notifications/ErrorNotification.vue";
import WarningNotification from "@/components/notifications/WarningNotification.vue";
import SuccessNotification from "@/components/notifications/SuccessNotification.vue";
import InfoNotification from "@/components/notifications/InfoNotification.vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { NotificationsSlotScope } from "@kyvg/vue3-notification";
</script>

<style lang="scss">
@include transition-effect(slide-rr);
</style>

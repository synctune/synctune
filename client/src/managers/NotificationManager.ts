// ------------------------------------------
// --- The manager file for notifications ---
// ------------------------------------------

import { useNotification } from "@kyvg/vue3-notification";
import type { NotificationsOptions } from "@kyvg/vue3-notification";
import { NOTIFICATION_GROUP } from "@/constants";

type NotificationTypes = "error" | "warning" | "success" | "info";

export type NotificationsOptionsOmitted = Omit<
  NotificationsOptions,
  "text" | "group" | "type"
>;

export const useNotificationManager = () => {
  const notification = useNotification();

  const showNotification = (
    group: string,
    type: NotificationTypes,
    text: string,
    options: NotificationsOptionsOmitted = {}
  ) => {
    notification.notify({
      ...options,
      group,
      type,
      text,
    });
  };

  const showErrorNotification = (
    text: string,
    options: NotificationsOptionsOmitted = {}
  ) => {
    showNotification(NOTIFICATION_GROUP, "error", text, options);
  };

  const showWarningNotification = (
    text: string,
    options: NotificationsOptionsOmitted = {}
  ) => {
    showNotification(NOTIFICATION_GROUP, "warning", text, options);
  };

  const showSuccessNotification = (
    text: string,
    options: NotificationsOptionsOmitted = {}
  ) => {
    showNotification(NOTIFICATION_GROUP, "success", text, options);
  };

  const showInfoNotification = (
    text: string,
    options: NotificationsOptionsOmitted = {}
  ) => {
    showNotification(NOTIFICATION_GROUP, "info", text, options);
  };

  return {
    showNotification,
    showErrorNotification,
    showWarningNotification,
    showSuccessNotification,
    showInfoNotification,
  };
};

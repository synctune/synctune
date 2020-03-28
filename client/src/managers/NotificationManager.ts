import { NotificationOptions } from "vue-notification";

// ------------------------------------------
// --- The manager file for notifications ---
// ------------------------------------------

type NotificationTypes = "error" | "warning" | "success" | "info";

export function showNotification(_this: any, group: string, type: NotificationTypes, text: string, options: NotificationOptions = {}) {
    _this.$notify({
        ...options,
        group, 
        type,
        text
    });
}

export function showErrorNotification(_this: any, text: string, options = {}) {
    showNotification(_this, "notification", "error", text, options);
}

export function showWarningNotification(_this: any, text: string, options = {}) {
    showNotification(_this, "notification", "warning",text, options);
}

export function showSuccessNotification(_this: any, text: string, options = {}) {
    showNotification(_this, "notification", "success", text, options);
}

export function showInfoNotification(_this: any, text: string, options = {}) {
    showNotification(_this, "notification", "info", text, options);
}
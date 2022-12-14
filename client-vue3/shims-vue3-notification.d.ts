// Importing here ensures the original type declarations are forwarded
// Source: https://stackoverflow.com/a/58203266
import "@kyvg/vue3-notification";

declare module "@kyvg/vue3-notification" {
  // Add another interface export for the type of the slot scope used when
  // customizing the notifications
  export declare interface NotificationsSlotScope {
    class: string;
    item: {
      id: number;
      text?: string;
      title?: string;
      type: string;
      state: number;
      speed: number;
      length: number;
      data: object;
      timer: number;
    };
    close?: () => void;
  }
}

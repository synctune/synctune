import { createApp } from "vue";
import { createPinia } from "pinia";
import VNotification from "@kyvg/vue3-notification";

import App from "./App.vue";
import router from "./router";

// Global style sheet
import "@/styling/main.scss";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(VNotification);

app.mount("#app");

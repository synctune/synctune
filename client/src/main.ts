import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import VNotification from "vue-notification";
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';

import * as IconRegister from "./registers/IconRegister";

import shortid from "shortid";

// Global style sheet
import "@/styling/main.scss";
import 'overlayscrollbars/css/OverlayScrollbars.css';

// Register all the used icons
IconRegister.register();

// Overlay scrollbars
Vue.component('overlay-scrollbar', OverlayScrollbarsComponent);

// Vue notification
Vue.use(VNotification);

Vue.config.productionTip = false;

// Setup shortid
shortid.characters("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_");

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");

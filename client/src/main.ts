import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueYouTubeEmbed from "vue-youtube-embed";
import VNotification from "vue-notification";
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';

import * as IconRegister from "./registers/IconRegister";

// Global style sheet
import "@/styling/main.scss";

// Register all the used icons
IconRegister.register();

// Overlay scrollbars
Vue.component('overlay-scrollbar', OverlayScrollbarsComponent);

// Vue notification
Vue.use(VNotification);

Vue.use(VueYouTubeEmbed, { global: false });

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");

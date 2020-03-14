import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueYouTubeEmbed from "vue-youtube-embed";

import "@/styling/main.scss";

Vue.use(VueYouTubeEmbed, {global: false});

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");

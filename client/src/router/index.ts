import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: '/test-rtc-local',
        name: "WebRTC Local Tests",
        component: () => 
            import(/* webpackChunkName: "about" */ "../views/tests/RTCLocal.vue")
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

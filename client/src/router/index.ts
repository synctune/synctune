import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
    {
        path: "/",
        name: "home",
        component: Home
    },
    {
        path: "/room",
        name: "room",
        component: () =>
            import(/* webpackChunkName: "Room" */ "../views/room/Room.vue")
    },
    {
        path: "/room/join/:id",
        name: "room-join",
        component: () => 
            import(/* webpackChunkName: "Room" */ "../views/room/RoomJoin.vue")
    },
    {
        path: "/room/create/:id",
        name: "room-create",
        component: () => 
            import(/* webpackChunkName: "Room" */ "../views/room/RoomCreate.vue")
    },
    // TODO: remove these tests routes
    // Test routes
    // {
    //     path: '/test-rtc-camera-local',
    //     name: "WebRTC Local Camera Tests",
    //     component: async () => 
    //         import(/* webpackChunkName: "RTCCameraLocal" */ "../views/tests/RTCCameraLocal.vue")
    // },
    // {
    //     path: "/test-rtc-audio-file-local",
    //     name: "WebRTC Local File Tests",
    //     component: async () => 
    //         import(/* webpackChunkName: "RTCCameraLocal" */ "../views/tests/RTCAudioFileLocal.vue")
    // },
    // {
    //     path: "/test-rtc-signalling-server",
    //     name: "WebRTC Connection via Signalling Server",
    //     component: async () => 
    //         import(/* webpackChunkName: "RTCSignallingServer" */ "../views/tests/RTCSignallingServer.vue")
    // }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

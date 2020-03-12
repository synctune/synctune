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
    // Test routes
    {
        path: '/test-rtc-camera-local',
        name: "WebRTC Local Camera Tests",
        component: () => 
            import(/* webpackChunkName: "RTCCameraLocal" */ "../views/tests/RTCCameraLocal.vue")
    },
    {
        path: "/test-rtc-audio-file-local",
        name: "WebRTC Local File Tests",
        component: () => 
            import(/* webpackChunkName: "RTCCameraLocal" */ "../views/tests/RTCAudioFileLocal.vue")
    },
    {
        path: "/test-rtc-signalling-server",
        name: "WebRTC Connection via Signalling Server",
        component: () => 
            import(/* webpackChunkName: "RTCSignallingServer" */ "../views/tests/RTCSignallingServer.vue")
    },
    {
        path: "/test-youtube",
        name: "YouTube embed API",
        component: () => 
            import(/* webpackChunkName: "YouTubeIframe" */ "../views/tests/YouTubeIframe.vue")
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

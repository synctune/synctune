import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import Home from "../views/Home.vue";
import Room from "../views/room/Room.vue";
import RoomJoin from "../views/room/RoomJoin.vue";
import RoomCreate from "../views/room/RoomCreate.vue";
import PageNotFound from "../views/PageNotFound.vue";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
    {
        path: "/",
        name: "home",
        component: Home,
        meta: {
            title: "SyncTune | Extend Your Sound"
        }
    },
    {
        path: "/room",
        name: "room",
        component: Room,
        meta: {
            title: "SyncTune | Room"
        }
    },
    {
        path: "/room/join/:id",
        name: "room-join",
        component: RoomJoin,
        meta: {
            title: "SyncTune | Joining Room"
        }
    },
    {
        path: "/room/create/:id",
        name: "room-create",
        component: RoomCreate,
        meta: {
            title: "SyncTune | Creating Room"
        }
    },
    {
        path: "*",
        name: "404",
        component: PageNotFound,
        meta: {
            title: "SyncTune | Page Not Found"
        }
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

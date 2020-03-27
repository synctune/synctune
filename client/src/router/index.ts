import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import Home from "../views/Home.vue";
import Room from "../views/room/Room.vue";
import RoomJoin from "../views/room/RoomJoin.vue";
import RoomCreate from "../views/room/RoomCreate.vue";

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
        component: Room
    },
    {
        path: "/room/join/:id",
        name: "room-join",
        component: RoomJoin
    },
    {
        path: "/room/create/:id",
        name: "room-create",
        component: RoomCreate
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;

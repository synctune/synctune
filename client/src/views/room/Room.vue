<template>
    <div id="Room">
        <room-owner-view v-if="isOwner && isConnected"/>
        <room-client-view v-else-if="!isOwner && isConnected" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import VueRouter, { Route } from 'vue-router';
import * as NotificationManager from "../../managers/NotificationManager";
import { DEFAULT_DOCUMENT_TITLE } from "../../constants";

import RoomOwnerView from "@/components/room/RoomOwnerView.vue";
import RoomClientView from "@/components/room/RoomClientView.vue";

type Computed = {
} & Pick<RoomStore.MapGettersStructure, 
    | RoomStore.Getters.isConnected 
    | RoomStore.Getters.isOwner
    | RoomStore.Getters.roomName
>


export default Vue.extend({
    components: {
        RoomOwnerView,
        RoomClientView,
    },
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected,
            isOwner: RoomStore.Getters.isOwner,
            roomName: RoomStore.Getters.roomName
        })
    },
    mounted() {
        const { isConnected, roomName }: Computed = this;

        if (!isConnected) {
            const router = this.$router as VueRouter;

            // Redirect back to home page and give an error message
            router.push("/").catch(err => {});
            NotificationManager.showErrorNotification(this, "Error: not connected to a room");
            return;
        }

        // Update title
        const route = this.$route as Route;
        document.title = `SyncTune | Room ${roomName}` || DEFAULT_DOCUMENT_TITLE;
    }
});
</script>

<style lang="scss" scoped>
    #Room {
        padding: 0 3rem;

        height: 100%;

        @include respond(phone) {
            padding: 1rem 2rem;
        }
    }
</style>
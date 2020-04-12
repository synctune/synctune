<template>
    <div id="Room">
        <room-owner-view v-if="isOwner && isConnected"/>
        <room-client-view v-else-if="!isOwner && isConnected" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from "vuex";
import * as RoomStore from "../../store/modules/room";
import VueRouter from 'vue-router';
import * as NotificationManager from "../../managers/NotificationManager";

import RoomOwnerView from "@/components/room/RoomOwnerView.vue";
import RoomClientView from "@/components/room/RoomClientView.vue";

type Computed = {
} & Pick<RoomStore.MapGettersStructure, 
    | RoomStore.Getters.isConnected 
    | RoomStore.Getters.isOwner
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
        })
    },
    mounted() {
        const { isConnected }: Computed = this;

        if (!isConnected) {
            const router = this.$router as VueRouter;

            // Redirect back to home page and give an error message
            router.push("/").catch(() => {});
            NotificationManager.showErrorNotification(this, "Error: not connected to a room");
            return;
        }
    }
});
</script>

<style lang="scss">
    #Room {
        padding: 0 3rem;

        height: 100%;

        @include respond(phone) {
            padding: 1rem 2rem;
        }
    }
</style>
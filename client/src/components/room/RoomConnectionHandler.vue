<template>
    <div id="RoomConnectionHandler">
        Joining Room: {{ roomName }}
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import { Getters, Actions, MapGettersStructure, MapActionsStructure } from "../../store/modules/room";
import VueRouter, { Route } from 'vue-router';
import ConnectionManager, { RoomData } from '../../rtc/ConnectionManager';
import * as NotificationManager from "../../managers/NotificationManager";

type Props = {
    mode: "join" | "create";
}

type Data = {
    roomName: string;
}

type ModeProp = "join" | "create";

type Computed = Pick<MapGettersStructure, Getters.isConnected | Getters.connectionManager> & {}

type Methods = {
    onSuccess(room: RoomData): void;
    onFail(roomName: string): void;
    onError(): void;
    clearEventListeners(): void;
}

export default Vue.extend({
    props: {
        mode: {
            type: String as () => ModeProp,
            validator(val) {
                return ["join", "create"].includes(val);
            }
        }
    },
    data() {
        return {
            roomName: ""
        }
    },
    computed: {
        ...mapGetters({
            connectionManager: Getters.connectionManager
        })
    },
    methods: {
        onSuccess(room: RoomData) {
            const router = this.$router as VueRouter;
            router.push(`/room`).catch(err => {});
        },
        onFail(roomName: string) {
            const { mode }: Props = this;
            const { clearEventListeners }: Methods = this;

            if (mode == "join") {
                NotificationManager.showErrorNotification(this, `Unable to join room '${roomName}'.`);
            } else {
                NotificationManager.showErrorNotification(this, `Unable to create room '${roomName}'.`);
            }

            clearEventListeners();

            // Go back to home page
            const router = this.$router as VueRouter;
            router.push(`/`).catch(err => {});
        },
        onError() {
            const { clearEventListeners }: Methods = this;

            NotificationManager.showErrorNotification(this, `An unexpected error occurred.`);

            clearEventListeners();

            // Go back to home page
            const router = this.$router as VueRouter;
            router.push(`/`).catch(err => {});
        },
        clearEventListeners() {
            const connectionManager = this.connectionManager as ConnectionManager;
            const { onSuccess, onFail, onError }: Methods = this;

            connectionManager.removeEventListener("room-not-exists", onFail);
            connectionManager.removeEventListener("room-already-exists", onFail);
            connectionManager.removeEventListener("room-joined", onSuccess);
            connectionManager.removeEventListener("room-created", onSuccess);
            connectionManager.removeEventListener("error", onError);
        }
    },
    mounted() {
        const { isConnected }: Computed = this;
        const { onSuccess, onFail, onError }: Methods = this;
        const { mode }: Props = this;

        const connectionManager = this.connectionManager as ConnectionManager;
        const route = this.$route as Route;
        const router = this.$router as VueRouter;

        const targetRoom = route.params["id"];
        this.roomName = (targetRoom) ? targetRoom : "";

        if (isConnected && connectionManager.room !== targetRoom) {
            NotificationManager.showErrorNotification(this, "Already connected to a room.");

            router.push("/").catch(err => {}); // Redirect to home
        }

        connectionManager.leaveRoom();

        // Join the room
        if (mode === "join") {
            connectionManager.joinRoom(targetRoom);

            connectionManager.addEventListener("room-not-exists", onFail);
            connectionManager.addEventListener("room-joined", onSuccess);
        } 
        // Create room
        else if (mode === "create") {
            connectionManager.createRoom(targetRoom);

            connectionManager.addEventListener("room-already-exists", onFail);
            connectionManager.addEventListener("room-created", onSuccess);
        }

        connectionManager.addEventListener("error", onError);
    }
});
</script>
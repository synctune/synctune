<template>
    <div id="RoomConnectionHandler">
        <div id="RoomConnectionHandler__prefix-text">
            {{ prefixText }}
        </div>

        <div id="RoomConnectionHandler__room-name" class="GLOBAL-monospace-font">
            {{ roomName }}
        </div>

        <circle-spinner 
            id="RoomConnectionHandler__spinner"
            :radius="35"
            :stroke="6"
            :animate-color="true"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from "vuex";
import { Getters, MapGettersStructure } from "../../store/modules/room";
import VueRouter, { Route } from 'vue-router';
import ConnectionManager, { RoomData } from '../../managers/ConnectionManager';
import * as NotificationManager from "../../managers/NotificationManager";

import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";

const CONNECTION_MANAGER_TAG = 'room-connection-handler';

type Props = {
    mode: "join" | "create";
}

type Data = {
    roomName: string;
}

type ModeProp = "join" | "create";

type Computed = {
    prefixText: string;
} & Pick<MapGettersStructure, 
    Getters.isConnected | Getters.connectionManager
>

type Methods = {
    onSuccess(room: RoomData): void;
    onFail(roomName: string): void;
    onError(): void;
    clearEventListeners(): void;
}

export default Vue.extend({
    components: {
        CircleSpinner
    },
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
        }),
        prefixText() {
            const { mode }: Props = this;
            return (mode === "join") ? "Joining Room" : "Creating Room";
        }
    },
    methods: {
        onSuccess() {
            const { clearEventListeners }: Methods = this;
            const router = this.$router as VueRouter;

            clearEventListeners();

            router.push(`/room`).catch(() => {});
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
            router.push(`/`).catch(() => {});
        },
        onError() {
            const { clearEventListeners }: Methods = this;

            NotificationManager.showErrorNotification(this, `An unexpected error occurred.`);

            clearEventListeners();

            // Go back to home page
            const router = this.$router as VueRouter;
            router.push(`/`).catch(() => {});
        },
        clearEventListeners() {
            const connectionManager = this.connectionManager as ConnectionManager;

            connectionManager.removeEventListenersByTag("room-not-exists", CONNECTION_MANAGER_TAG);
            connectionManager.removeEventListenersByTag("room-already-exists", CONNECTION_MANAGER_TAG);
            connectionManager.removeEventListenersByTag("room-joined", CONNECTION_MANAGER_TAG);
            connectionManager.removeEventListenersByTag("room-created", CONNECTION_MANAGER_TAG);
            connectionManager.removeEventListenersByTag("error", CONNECTION_MANAGER_TAG);
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
        this.roomName = (targetRoom) ? targetRoom.toUpperCase() : "";

        if (isConnected && connectionManager.room !== targetRoom) {
            NotificationManager.showErrorNotification(this, "Already connected to a room.");

            router.push("/").catch(() => {}); // Redirect to home
            return;
        }

        if (!targetRoom) {
            NotificationManager.showErrorNotification(this, `No room name provided.`);
            router.push("/").catch(() => {}); // Redirect to home
            return;
        }

        const targetRoomSanitized = targetRoom.trim().toUpperCase();

        connectionManager.leaveRoom();

        // Join the room
        if (mode === "join") {
            connectionManager.joinRoom(targetRoomSanitized);

            connectionManager.addEventListener("room-not-exists", onFail);
            connectionManager.addEventListener("room-joined", onSuccess);
        } 
        // Create room
        else if (mode === "create") {
            connectionManager.createRoom(targetRoomSanitized);

            connectionManager.addEventListener("room-already-exists", onFail);
            connectionManager.addEventListener("room-created", onSuccess);
        }

        connectionManager.addEventListener("error", onError);
    }
});
</script>

<style lang="scss">
    #RoomConnectionHandler {
        height: 100%;
        
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        & #RoomConnectionHandler__prefix-text {
            font-size: 1.5rem;
        }

        & #RoomConnectionHandler__room-name {
            font-size: 3rem;
            font-weight: 600;
        }

        & #RoomConnectionHandler__spinner {
            margin-top: 2rem;
        }
    }
</style>
<template>
    <div id="RoomConnectionHandler">
        Joining Room: {{ roomName }}
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import { Getters, Actions, MapGettersStructure, MapActionsStructure } from "../store/modules/room";
import VueRouter, { Route } from 'vue-router';
import ConnectionManager, { RoomData } from '../rtc/ConnectionManager';

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
    onFail(room: string): void;
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
            console.log(`Room '${room.roomName}' successfully joined`); // TODO: remove

            const router = this.$router as VueRouter;
            router.push(`/room`).catch(err => {});
        },
        onFail(room: RoomData) {
            console.log(`Unable to join room '${room.roomName}'`); // TODO: remove

            // TODO: handle failure
        }
    },
    mounted() {
        const { isConnected }: Computed = this;
        const { onSuccess, onFail }: Methods = this;
        const { mode }: Props = this;

        const connectionManager = this.connectionManager as ConnectionManager;
        const route = this.$route as Route;
        const router = this.$router as VueRouter;

        const targetRoom = route.params["id"];
        this.roomName = (targetRoom) ? targetRoom : "";

        if (isConnected && connectionManager.room !== targetRoom) {
            // TODO: show an actual dialog box
            const goAnyways = confirm("Warning: already connected to a room! Are you sure you want to leave this room?");

            if (!goAnyways) { // Answer: no
                router.push("/").catch(err => {}); // Redirect to home
                return;
            }
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
    }
});
</script>
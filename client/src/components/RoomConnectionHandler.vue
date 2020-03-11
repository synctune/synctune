<template>
    <div id="RoomConnectionHandler">
        Joining Room: {{ roomName }}
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import { Getters, Actions, MapGettersStructure, MapActionsStructure } from "../store/modules/room";
import RoomManager from '../rtc/RoomManager';
import VueRouter, { Route } from 'vue-router';
import SignallingSocket from '../socket/SignallingSocket';

type Props = {
    mode: "join" | "create";
}

type Data = {
    roomName: string;
}

type ModeProp = "join" | "create";

type Computed = Pick<MapGettersStructure, Getters.roomManager | Getters.isConnected> & {}

type Methods = Pick<MapActionsStructure, Actions.setRoomManager | Actions.deleteRoomManager> & {
    onSuccess(room: string): void;
    onFail(room: string): void;
}

export default Vue.extend({
    props: {
        mode: {
            type: String,
            validator(val) {
                return ["join", "create"].includes(val);
            }
        }
    },
    data() {
        return {
            roomName: null
        }
    },
    computed: {
        ...mapGetters({
            roomManager: Getters.roomManager,
            isConnected: Getters.isConnected,
        })
    },
    methods: {
        ...mapActions({
            setRoomManager: Actions.setRoomManager,
            deleteRoomManager: Actions.deleteRoomManager
        }),
        onSuccess(room: string) {
            console.log(`Room '${room}' successfully joined`); // TODO: remove

            const router = this.$router as VueRouter;
            router.push(`/room`);
        },
        onFail(room: string) {
            console.log(`Unable to join room '${room}'`); // TODO: remove

            // TODO: handle failure

            // Make sure there is no room manager object in the store
            const { deleteRoomManager }: Methods = this;
            deleteRoomManager();
        }
    },
    mounted() {
        const { isConnected }: Computed = this;
        const { setRoomManager, onSuccess, onFail }: Methods = this;
        const { mode }: Props = this;

        let roomManager = this.roomManager as RoomManager;
        const route = this.$route as Route;
        const router = this.$router as VueRouter;

        const id = route.params["id"];
        this.roomName = id;

        if (isConnected && roomManager.room !== id) {
            // TODO: show an actual dialog box
            const goAnyways = confirm("Warning: already connected to a room! Are you sure you want to leave this room?");

            if (!goAnyways) {
                router.push("/"); // Redirect to home
                return;
            }
        }

        // Create a new room manager, if needed
        if (!roomManager) {
            roomManager = new RoomManager();
        }

        // Leave the room, if it already is in one
        roomManager?.leaveRoom();

        // Join the room
        if (mode === "join") {
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            // Setup event handlers
            signallingSocket.on("room-not-exists", onFail);
            signallingSocket.on("room-joined", onSuccess);

            roomManager.joinRoom(id);
        } 
        // Create room
        else if (mode === "create") {
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            // Setup event handlers
            signallingSocket.on("room-exists", onFail);
            signallingSocket.on("room-created", onSuccess);

            roomManager.createRoom(id);
        }

        setRoomManager({ roomManager });
    }
});
</script>
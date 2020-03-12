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
        const { setRoomManager, deleteRoomManager, onSuccess, onFail }: Methods = this;
        const { mode }: Props = this;

        let roomManager = this.roomManager as RoomManager;
        const route = this.$route as Route;
        const router = this.$router as VueRouter;

        const targetRoom = route.params["id"];
        this.roomName = (targetRoom) ? targetRoom : "";

        if (isConnected && roomManager?.room !== targetRoom) {
            // TODO: show an actual dialog box
            const goAnyways = confirm("Warning: already connected to a room! Are you sure you want to leave this room?");

            if (!goAnyways) { // Answer: no
                router.push("/"); // Redirect to home
                return;
            }
        }

        // Disconnect and remove current room manager, if it exists
        if (roomManager) {
            roomManager.leaveRoom();
            deleteRoomManager();
        }

        // Create a new room manager
        roomManager = new RoomManager();

        // Join the room
        if (mode === "join") {
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            // Setup event handlers
            signallingSocket.on("room-not-exists", onFail);
            signallingSocket.on("room-joined", onSuccess);

            roomManager.joinRoom(targetRoom);
        } 
        // Create room
        else if (mode === "create") {
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            // Setup event handlers
            signallingSocket.on("room-exists", onFail);
            signallingSocket.on("room-created", onSuccess);

            roomManager.createRoom(targetRoom);
        }

        // Update store with the new room manager
        setRoomManager({ roomManager });
    }
});
</script>
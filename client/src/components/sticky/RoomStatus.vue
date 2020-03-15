<template>
    <div id="RoomStatus__container">
        <div id="RoomStatus">
            This shows the current room status
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import RoomManager from '../../rtc/RoomManager';
import SignallingSocket from '../../socket/SignallingSocket';
import VueRouter from 'vue-router';

type Computed = {

} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
    | RoomStore.Getters.roomManager
>

type Methods = {
    setupSignallingSocketListeners(signallingSocket: SignallingSocket): void;
    onRoomLeft(): void;
} & Pick<RoomStore.MapActionsStructure,
    RoomStore.Actions.deleteRoomManager
>;

export default Vue.extend({
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected,
            roomManager: RoomStore.Getters.roomManager,
        })
    },
    methods: {
        ...mapActions({
            deleteRoomManager: RoomStore.Actions.deleteRoomManager
        }),
        setupSignallingSocketListeners(signallingSocket: SignallingSocket) {
            signallingSocket.on("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });
        },
        onRoomLeft() {
            const { deleteRoomManager }: Methods = this;
            const router = this.$router as VueRouter;

            deleteRoomManager();

            // Go back to home page
            router.push('/');
        }
    },
    watch: {
        isConnected(connection: boolean) {
            if (!connection) return;

            // Connection established
            const { setupSignallingSocketListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            setupSignallingSocketListeners(roomManager.signallingSocket);
        }
    }
});
</script>

<style lang="scss" scoped>
    #RoomStatus__container {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0;

        padding: 0 0.5rem 0.5rem 0.5rem;

        max-width: 20rem;
        width: 100%;
    }

    #RoomStatus {
        background-color: rgb(57, 191, 231);

        width: 100%;
        border-radius: 0.1rem;
        padding: 0.5rem;
    }
</style>
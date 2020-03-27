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
import VueRouter from 'vue-router';
import SignallingSocket from '../../socket/SignallingSocket';
import RoomManager from '../../rtc/RoomManager';
import PeerManager from '../../rtc/PeerManager';
import ConnectionManager from "../../rtc/ConnectionManager";

type Computed = {

} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
    | RoomStore.Getters.roomManager
    | RoomStore.Getters.connectionManager
> & Pick<AudioStore.MapGettersStructure,
    AudioStore.Getters.audioFile
    | AudioStore.Getters.audioFileMetadata
>

type Methods = {
    // setupSignallingSocketListeners(signallingSocket: SignallingSocket): void;
    // setupPeerManagerListeners(peerManager: PeerManager): void;
    setupConnectionManagerListeners(connectionManager: ConnectionManager): void;
    onRoomLeft(): void;
    onClientRtcJoined(clientId: string): void;
} & Pick<RoomStore.MapActionsStructure,
    RoomStore.Actions.deleteRoomManager
>;

export default Vue.extend({
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected,
            roomManager: RoomStore.Getters.roomManager,
            connectionManager: RoomStore.Getters.connectionManager,
            audioFile: AudioStore.Getters.audioFile,
            audioFileMetadata: AudioStore.Getters.audioFileMetadata
        })
    },
    methods: {
        ...mapActions({
            deleteRoomManager: RoomStore.Actions.deleteRoomManager
        }),
        // setupSignallingSocketListeners(signallingSocket: SignallingSocket) {
        //     signallingSocket.on("room-left", () => {
        //         const { onRoomLeft }: Methods = this;
        //         onRoomLeft();
        //     });
        // },
        // setupPeerManagerListeners(peerManager: PeerManager) {
        //     peerManager.addEventListener("datachannelsready", ({ clientId }) => {
        //         const { onClientRtcJoined }: Methods = this;
        //         onClientRtcJoined(clientId);
        //     });
        // },
        setupConnectionManagerListeners(connectionManager: ConnectionManager) {
            connectionManager.addEventListener("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });

            connectionManager.addEventListener("client-joined", ({ clientId }) => {
                const { onClientRtcJoined }: Methods = this;
                onClientRtcJoined(clientId);
            });
        },
        onRoomLeft() {
            const router = this.$router as VueRouter;

            // const { deleteRoomManager }: Methods = this;
            // deleteRoomManager();

            // Go back to home page
            router.push('/').catch(err => {});
        },
        onClientRtcJoined(clientId: string) {
            const { audioFile, audioFileMetadata }: Computed = this;
            // const roomManager = this.roomManager as RoomManager;
            const connectionManager = this.connectionManager as ConnectionManager;

            if (audioFile && audioFileMetadata) {
                console.log("syncing existing audio file to new client", clientId); // TODO: remove
                // roomManager.syncAudioFile(audioFile, audioFileMetadata, [clientId]);
                connectionManager.syncAudioFile(audioFile, audioFileMetadata, [clientId]);
            }
        }
    },
    watch: {
        isConnected(connection: boolean) {
            if (!connection) return;

            // Connection established
            const { setupConnectionManagerListeners }: Methods = this;
            const connectionManager = this.connectionManager as ConnectionManager;

            setupConnectionManagerListeners(connectionManager);

            // const roomManager = this.roomManager as RoomManager;
            // setupSignallingSocketListeners(roomManager.signallingSocket);

            // roomManager.addEventListener("peermanagercreated", () => {
            //     const peerManager = roomManager.peerManager as PeerManager;
            //     setupPeerManagerListeners(peerManager);
            // });
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
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
import PeerManager from '../../rtc/PeerManager';

type Computed = {

} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
    | RoomStore.Getters.roomManager
> & Pick<AudioStore.MapGettersStructure,
    AudioStore.Getters.audioFile
    | AudioStore.Getters.audioFileMetadata
>

type Methods = {
    setupSignallingSocketListeners(signallingSocket: SignallingSocket): void;
    setupPeerManagerListeners(peerManager: PeerManager): void;
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
            audioFile: AudioStore.Getters.audioFile,
            audioFileMetadata: AudioStore.Getters.audioFileMetadata
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
        setupPeerManagerListeners(peerManager: PeerManager) {
            peerManager.addEventListener("datachannelsready", ({ clientId }) => {
                const { onClientRtcJoined }: Methods = this;
                onClientRtcJoined(clientId);
            });
        },
        onRoomLeft() {
            const { deleteRoomManager }: Methods = this;
            const router = this.$router as VueRouter;

            deleteRoomManager();

            // Go back to home page
            router.push('/');
        },
        onClientRtcJoined(clientId: string) {
            const { audioFile, audioFileMetadata }: Computed = this;
            const roomManager = this.roomManager as RoomManager;

            if (audioFile && audioFileMetadata) {
                console.log("syncing existing audio file to new client", clientId); // TODO: remove
                roomManager.syncAudioFile(audioFile, audioFileMetadata, [clientId]);
            }
        }
    },
    watch: {
        isConnected(connection: boolean) {
            if (!connection) return;

            // Connection established
            const { setupSignallingSocketListeners, setupPeerManagerListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            setupSignallingSocketListeners(roomManager.signallingSocket);

            roomManager.addEventListener("peermanagercreated", () => {
                const peerManager = roomManager.peerManager as PeerManager;
                setupPeerManagerListeners(peerManager);
            });
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
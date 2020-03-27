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
import ConnectionManager from "../../rtc/ConnectionManager";

type Computed = {

} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
    | RoomStore.Getters.connectionManager
> & Pick<AudioStore.MapGettersStructure,
    AudioStore.Getters.audioFile
    | AudioStore.Getters.audioFileMetadata
>

type Methods = {
    setupConnectionManagerListeners(connectionManager: ConnectionManager): void;
    onRoomLeft(): void;
    onClientRtcJoined(clientId: string): void;
}

export default Vue.extend({
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected,
            connectionManager: RoomStore.Getters.connectionManager,
            audioFile: AudioStore.Getters.audioFile,
            audioFileMetadata: AudioStore.Getters.audioFileMetadata
        })
    },
    mounted() {
        // Connection established
        const { setupConnectionManagerListeners }: Methods = this;
        const connectionManager = this.connectionManager as ConnectionManager;

        console.log("RoomStatus: setting up connection manager listeners", connectionManager);

        setupConnectionManagerListeners(connectionManager);
    },
    methods: {
        setupConnectionManagerListeners(connectionManager: ConnectionManager) {
            connectionManager.addEventListener("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });

            connectionManager.addEventListener("client-joined", ({ clientId }) => {
                console.log("Room Status: client-joined"); // TODO: remove
                const { onClientRtcJoined }: Methods = this;
                onClientRtcJoined(clientId);
            });
        },
        onRoomLeft() {
            const router = this.$router as VueRouter;

            // Go back to home page
            router.push('/').catch(err => {});
        },
        onClientRtcJoined(clientId: string) {
            const { audioFile, audioFileMetadata }: Computed = this;
            const connectionManager = this.connectionManager as ConnectionManager;

            if (audioFile && audioFileMetadata) {
                console.log("syncing existing audio file to new client", clientId); // TODO: remove
                connectionManager.syncAudioFile(audioFile, audioFileMetadata, [clientId]);
            }
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
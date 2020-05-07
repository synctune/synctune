<template>
    <transition name="slide-lr-abs" mode="out-in">
        <div 
            class="RoomStatus__wrapper"
            v-if="isConnected && onDisplayableRoute"
        >
            <container 
                :class="[
                    'RoomStatus',
                    (audioLoaded) ? 'audio-loaded' : null
                ]"
                base-class="RoomStatus__container"
                :vertical-accents="true"
            >
                <artwork-thumbnail 
                    class="RoomStatus__artwork-thumbnail"
                />

                <div class="RoomStatus__song-title">
                    {{ trackTitleDisplay }}
                </div>

                <next-button 
                    class="RoomStatus__to-room-button"
                    @click="onToRoomClick"
                />
            </container>
        </div>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import VueRouter, { Route } from 'vue-router';
import ConnectionManager, { AudioFileMetadata } from "../../managers/ConnectionManager";

import Container from "@/components/ui/Container.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";
import NextButton from "@/components/ui/button/NextButton.vue";

// The route names that the room status will display itself on
const DISPLAYABLE_ROUTE_NAMES = ['home'];

type Computed = {
    trackTitleDisplay: string;
    onDisplayableRoute: boolean;
} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
    | RoomStore.Getters.connectionManager
    | RoomStore.Getters.connectedClients
> & Pick<AudioStore.MapGettersStructure,
    AudioStore.Getters.audioFile
    | AudioStore.Getters.audioFileMetadata
    | AudioStore.Getters.audioLoaded
    | AudioStore.Getters.isPlaying
    | AudioStore.Getters.audioContext
    | AudioStore.Getters.startedAt
>

type Methods = {
    setupConnectionManagerListeners(connectionManager: ConnectionManager): void;
    onRoomLeft(): void;
    onClientRtcJoined(clientId: string): void;
    onToRoomClick(): void;
}

export default Vue.extend({
    components: {
        Container,
        ArtworkThumbnail,
        NextButton
    },
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected,
            connectionManager: RoomStore.Getters.connectionManager,
            connectedClients: RoomStore.Getters.connectedClients,
            audioFile: AudioStore.Getters.audioFile,
            audioFileMetadata: AudioStore.Getters.audioFileMetadata,
            audioLoaded: AudioStore.Getters.audioLoaded,
            isPlaying: AudioStore.Getters.isPlaying,
            audioContext: AudioStore.Getters.audioContext,
            startedAt: AudioStore.Getters.startedAt
        }),
        trackTitleDisplay() {
            const { audioLoaded }: Computed = this;
            const audioFileMetadata = this.audioFileMetadata as AudioFileMetadata;

            return (audioLoaded) ? audioFileMetadata.name : "<no track currently loaded>";
        },
        onDisplayableRoute() {
            const route = this.$route as Route;
            return (route.name) ? DISPLAYABLE_ROUTE_NAMES.includes(route.name) : false;
        }
    },
    mounted() {
        // Connection established
        const { setupConnectionManagerListeners }: Methods = this;
        const connectionManager = this.connectionManager as ConnectionManager;

        setupConnectionManagerListeners(connectionManager);
    },
    methods: {
        setupConnectionManagerListeners(connectionManager: ConnectionManager) {
            connectionManager.addEventListener("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });

            connectionManager.addEventListener("client-joined", ({ clientId }) => {
                const { onClientRtcJoined }: Methods = this;
                onClientRtcJoined(clientId);
            });

            connectionManager.addEventListener("client-left", ({ clientId }) => {
                const TAG = `room-status-init-audio-sync-${clientId}`;
                connectionManager.removeEventListenersByTag("clienttimesyncchanged", TAG);
                connectionManager.removeEventListenersByTag("clientreadytoplay", TAG);
            });
        },
        onRoomLeft() {
            // Go back to home page
            const router = this.$router as VueRouter;
            router.push('/').catch(() => {});
        },
        onClientRtcJoined(clientId: string) {
            const connectionManager = this.connectionManager as ConnectionManager;

            const TAG = `room-status-init-audio-sync-${clientId}`;

            // Sync audio file once the intial timesync is complete
            connectionManager.addEventListener("clienttimesyncchanged", ({ clientId: syncedClientID, timesynced }) => {
                const { 
                    audioFile, 
                    audioFileMetadata, 
                    isPlaying,
                    audioContext,
                    startedAt }: Computed = this;

                if (syncedClientID !== clientId) return;

                // If audio is playing, send the play signal to the newly connected client
                if (isPlaying) {
                    connectionManager.sendPlaySignal(audioContext.currentTime - startedAt, 0, false, false, false, [clientId]);
                }

                if (timesynced && audioFile && audioFileMetadata) {
                    connectionManager.syncAudioFile(audioFile, audioFileMetadata, false, [clientId]);

                    // Clear event listeners for this client (so our listeners don't get triggered again)
                    connectionManager.removeEventListenersByTag("clienttimesyncchanged", TAG);
                    connectionManager.removeEventListenersByTag("clientreadytoplay", TAG);
                }
            }, TAG);

            connectionManager.addEventListener("clientreadytoplay", (readyClientId) => {
                if (readyClientId !== clientId) return;
                // Clear event listeners for this client (so our listeners don't get triggered again)
                connectionManager.removeEventListenersByTag("clienttimesyncchanged", TAG);
                connectionManager.removeEventListenersByTag("clientreadytoplay", TAG);
            }, TAG);
        },
        onToRoomClick() {
            // Go to room page
            const router = this.$router as VueRouter;
            router.push('/room').catch(() => {});
        }
    }
});
</script>

<style lang="scss">
    $max-width: 40rem;
    $artwork-thumbnail-max-width: 5rem;

    .RoomStatus__wrapper {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0;

        padding: 0 0.5rem 0.5rem 0.5rem;

        max-width: $max-width;
        width: 100%;

        z-index: 2;

        .RoomStatus {
            width: 100%;

            & .RoomStatus__container {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                align-items: center;

                // Override size for the artwork thumbnail
                & .RoomStatus__artwork-thumbnail {
                    $note-padding: 1rem;

                    max-width: $artwork-thumbnail-max-width;

                    & .ArtworkThumbnail__note-icon {
                        width: calc(100% - 2 * #{$note-padding});
                        height: calc(100% - 2 * #{$note-padding});
                    }
                }

                & .RoomStatus__song-title {
                    font-size: 1.5rem;
                    font-weight: 500;

                    text-align: center;

                    color: color-link("CurrentSongContainer", "text", "primary");
                }
            }

            &:not(.audio-loaded) {
                & .RoomStatus__container .RoomStatus__song-title {
                    color: color-link("CurrentSongContainer", "text", "disabled");
                }
            }
        }
    }

    // Transition effects
    @include transition-effect(slide-lr-abs, 0.3s, 50%);
</style>
<template>
    <audio id="AudioPlayer" ref="audioPlayerEl"></audio>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import RoomManager from '../../rtc/RoomManager';
import SignallingSocket from '../../socket/SignallingSocket';

type Computed = {}
    & Pick<RoomStore.MapGettersStructure,
        RoomStore.Getters.roomManager
        | RoomStore.Getters.isConnected
    > 
    & Pick<AudioStore.MapGettersStructure,
        AudioStore.Getters.isPlaying 
        | AudioStore.Getters.audioFile
        | AudioStore.Getters.audioLoaded
        | AudioStore.Getters.syncedClients
    >;

type Methods = {
    setupRoomManagerListeners(roomManager: RoomManager): void;
    loadAudioFile(audioFile: Blob): void;
    unloadAudioFile(): void;
    playAudio(startLocation: number, startTime: number): void;
    pauseAudio(): void;
    stopAudio(): void;
    clientSynced(clientId: string): void;
    clientLeft(clientId: string): void;
    resetSyncList(): void;
    onCanPlayThrough(): void;
} & Pick<AudioStore.MapActionsStructure,
    AudioStore.Actions.setIsPlaying
    | AudioStore.Actions.setAudioFile
    | AudioStore.Actions.setAudioLoaded
    | AudioStore.Actions.setSyncedClients
>;


export default Vue.extend({
    computed: {
        ...mapGetters({
            roomManager: RoomStore.Getters.roomManager,
            isConnected: RoomStore.Getters.isConnected,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
            syncedClients: AudioStore.Getters.syncedClients
        })
    },
    methods: {
        ...mapActions({
            setIsPlaying: AudioStore.Actions.setIsPlaying,
            setAudioFile: AudioStore.Actions.setAudioFile,
            setAudioLoaded: AudioStore.Actions.setAudioLoaded,
            setSyncedClients: AudioStore.Actions.setSyncedClients
        }),
        setupRoomManagerListeners(roomManager: RoomManager) {
            const { 
                loadAudioFile, 
                unloadAudioFile, 
                playAudio, 
                pauseAudio, 
                stopAudio,
                clientSynced, 
                resetSyncList, 
                clientLeft }: Methods = this;

            roomManager.addEventListener("audiofilesyncing", (audioFile) => {
                resetSyncList();
                loadAudioFile(audioFile);
            });

            roomManager.addEventListener("audiofilereceived", (audioFile) => {
                loadAudioFile(audioFile);
            });

            roomManager.addEventListener("playsignalreceived", (data) => {
                playAudio(data.startLocation, data.startTime);
            });

            roomManager.addEventListener("pausesignalreceived", (sentTime) => {
                pauseAudio();
            });

            roomManager.addEventListener("stopsignalreceived", (sentTime) => {
                stopAudio();
            });

            if (roomManager.isOwner) {
                roomManager.addEventListener("clientreceivedaudiofile", clientId => {
                    clientSynced(clientId);
                });
            }

            const signallingSocket = roomManager.signallingSocket as SignallingSocket;
            signallingSocket.on("room-left", () => {
                stopAudio();
                resetSyncList();
                unloadAudioFile();
            });

            signallingSocket.on("client-left", (_, clientId: string) => {
                clientLeft(clientId);
            });
        },
        loadAudioFile(audioFile: Blob) {
            const { setAudioFile, setAudioLoaded, setIsPlaying, onCanPlayThrough }: Methods = this;

            setAudioFile({ audioFile });

            const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });

            audioPlayerEl.addEventListener("canplaythrough", onCanPlayThrough);

            audioPlayerEl.src = URL.createObjectURL(audioFile);
            audioPlayerEl.load();
        },
        unloadAudioFile() {
            const { setAudioFile, setAudioLoaded, setIsPlaying, onCanPlayThrough }: Methods = this;
            const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            audioPlayerEl.removeEventListener("canplaythrough", onCanPlayThrough);

            setAudioFile({ audioFile: null });
            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
        },
        playAudio(startLocation: number, startTime: number) {
            // TODO: delay the start time using the synchronized time
            // TODO: handle if audio has not been loaded yet

            const { audioLoaded }: Computed = this;
            const { setIsPlaying }: Methods = this;
            const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            if (!audioPlayerEl.src) return;
            if (!audioLoaded) {
                console.warn("Audio file not loaded fully yet, audio will not play instantly"); // TODO: remove
            }

            console.log("Playing audio"); // TODO: remove
            audioPlayerEl.currentTime = startLocation;
            audioPlayerEl.play();
            setIsPlaying({ playing: true });
        },
        pauseAudio() {
            const { setIsPlaying }: Methods = this;
            const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            if (!audioPlayerEl.src) return;

            audioPlayerEl.pause();
            setIsPlaying({ playing: false });
        },
        stopAudio() {
            const { setIsPlaying }: Methods = this;
            const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            if (!audioPlayerEl.src) return;

            audioPlayerEl.pause();
            audioPlayerEl.currentTime = 0;
            setIsPlaying({ playing: false });
        },
        clientSynced(clientId: string) {
            const { syncedClients }: Computed = this;
            const { setSyncedClients }: Methods = this;
            setSyncedClients({ syncedClients: [...syncedClients, clientId] });
        },
        clientLeft(clientId: string) {
            const { syncedClients }: Computed = this;
            const { setSyncedClients }: Methods = this;

            const idx = syncedClients.indexOf(clientId);
            if (idx >= 0) {
                const newSyncList = [...syncedClients];
                newSyncList.splice(idx, 1);
                setSyncedClients({ syncedClients: newSyncList });
            }
        },
        resetSyncList() {
            const { setSyncedClients }: Methods = this;
            setSyncedClients({ syncedClients: [] });
        },
        onCanPlayThrough() {
            const { setAudioLoaded }: Methods = this;
            console.log("canplaythrough audio file"); // TODO: remove
            setAudioLoaded({ loaded: true });
        }
    },
    watch: {
        // Connection status changed
        isConnected(connected: boolean) {
            // Connection closed, clear audio file
            if (!connected) {
                const { unloadAudioFile }: Methods = this;
                unloadAudioFile();
                return;
            }

            // Connection created, setup room manager listeners
            const { setupRoomManagerListeners }: Methods = this;
            const roomManager = this.roomManager! as RoomManager;
            setupRoomManagerListeners(roomManager);
        }
    }
});
</script>

<style lang="scss" scoped>
    #AudioPlayer {

    }
</style>
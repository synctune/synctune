<template>
    <div id="AudioPlayer"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import RoomManager from '../../rtc/RoomManager';
import SignallingSocket from '../../socket/SignallingSocket';
import PeerManager from '../../rtc/PeerManager';

type Data = {
    audioContext: AudioContext;
    audioSource: AudioBufferSourceNode | null;
    audioBuffer: AudioBuffer | null;
    startedAt: number;
    pausedAt: number;
}

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
    data() {
        return {
            audioContext: new AudioContext(),
            audioSource: null,
            audioBuffer: null,
            startedAt: 0,
            pausedAt: 0
        }
    },
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
                roomManager.addEventListener("clientreadytoplay", clientId => {
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
            const { audioContext }: Data = this;
            const { setAudioFile, setAudioLoaded, setIsPlaying, onCanPlayThrough }: Methods = this;

            setAudioFile({ audioFile });

            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
            this.startedAt = 0;
            this.pausedAt = 0;

            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(audioFile);

            fileReader.addEventListener("load", (event) => {
                const arrBuffer = event.target?.result as ArrayBuffer;

                audioContext.decodeAudioData(arrBuffer, (audioBuffer) => {
                    this.audioBuffer = audioBuffer;
                    setAudioLoaded({ loaded: true });

                    // Send ready to play signal
                    const roomManager = this.roomManager as RoomManager;
                    const peerManager = roomManager.peerManager as PeerManager;
                    peerManager!.sendReadyToPlaySignal(roomManager.id);
                });
            });
        },
        unloadAudioFile() {
            const { audioContext, audioSource }: Data = this;
            const { setAudioFile, setAudioLoaded, setIsPlaying, onCanPlayThrough }: Methods = this;

            if (audioSource) {
                audioSource.disconnect();
                this.audioSource = null;
            }

            setAudioFile({ audioFile: null });
            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
            this.startedAt = 0;
            this.pausedAt = 0;
        },
        async playAudio(startLocation: number, startTime: number) {
            // TODO: delay the start time using the synchronized time
            // TODO: handle if audio has not been loaded yet

            const { audioContext, audioBuffer, pausedAt }: Data = this;
            const { audioLoaded }: Computed = this;
            const { setIsPlaying }: Methods = this;

            if (!audioLoaded) {
                console.warn("Unable to play, audio file not loaded"); // TODO: remove
                return;
            }

            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioContext.destination);

            this.audioSource = audioSource;
            const offset = pausedAt;

            audioSource.start(0, offset);

            this.startedAt = audioContext.currentTime - offset;
            this.pausedAt = 0;

            setIsPlaying({ playing: true });
        },
        async pauseAudio() {
            const { audioSource, audioContext, startedAt }: Data = this;
            const { setIsPlaying, stopAudio }: Methods = this;

            const elapsedTime = audioContext.currentTime - startedAt;
            stopAudio();
            this.pausedAt = elapsedTime;
        },
        stopAudio() {
            const { audioSource }: Data = this;
            const { setIsPlaying }: Methods = this;

            if (audioSource) {
                audioSource.disconnect();
                audioSource.stop(0);
                this.audioSource = null;
            }

            this.startedAt = 0;
            this.pausedAt = 0;
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
        onCanPlayThrough() { // TODO: remove
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
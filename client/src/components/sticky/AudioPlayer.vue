<template>
    <audio id="AudioPlayer" ref="audioPlayerEl"></audio>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import RoomManager from '../../rtc/RoomManager';

type Computed = {}
    & Pick<RoomStore.MapGettersStructure,
        RoomStore.Getters.roomManager
        | RoomStore.Getters.isConnected
    > 
    & Pick<AudioStore.MapGettersStructure,
        AudioStore.Getters.isPlaying 
        | AudioStore.Getters.audioFile
        | AudioStore.Getters.audioLoaded
    >;

type Methods = {
    setupRoomManagerListeners(roomManager: RoomManager): void;
    loadAudioFile(audioFile: Blob): void;
    unloadAudioFile(): void;
    playAudio(startTime: number): void;
    pauseAudio(): void;
    stopAudio(): void;
} & Pick<AudioStore.MapActionsStructure,
    AudioStore.Actions.setIsPlaying
    | AudioStore.Actions.setAudioFile
    | AudioStore.Actions.setAudioLoaded
>;


export default Vue.extend({
    computed: {
        ...mapGetters({
            roomManager: RoomStore.Getters.roomManager,
            isConnected: RoomStore.Getters.isConnected,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded
        })
    },
    methods: {
        ...mapActions({
            setIsPlaying: AudioStore.Actions.setIsPlaying,
            setAudioFile: AudioStore.Actions.setAudioFile,
            setAudioLoaded: AudioStore.Actions.setAudioLoaded
        }),
        setupRoomManagerListeners(roomManager: RoomManager) {
            const { loadAudioFile }: Methods = this;

            roomManager.addEventListener("audiofilesyncing", (audioFile) => {
                loadAudioFile(audioFile);
            });

            roomManager.addEventListener("audiofilereceived", (audioFile) => {
                loadAudioFile(audioFile);
            });

            roomManager.addEventListener("playsignalreceived", (startTime) => {
                const { playAudio }: Methods = this;
                playAudio(startTime);
            });

            roomManager.addEventListener("pausesignalreceived", (sentTime) => {
                const { pauseAudio }: Methods = this;
                pauseAudio();
            });

            roomManager.addEventListener("stopsignalreceived", (sentTime) => {
                const { stopAudio }: Methods = this;
                stopAudio();
            });
        },
        loadAudioFile(audioFile: Blob) {
            const { setAudioFile, setAudioLoaded, setIsPlaying }: Methods = this;

            setAudioFile({ audioFile });

            const audioPlayerEl = this.$refs.audioPlayerEl as HTMLAudioElement;

            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });

            audioPlayerEl.addEventListener("canplaythrough", () => {
                console.log("canplaythrough audio file"); // TODO: remove
                setAudioLoaded({ loaded: true });
            });

            audioPlayerEl.src = URL.createObjectURL(audioFile);
            audioPlayerEl.load();
        },
        unloadAudioFile() {
            const { setAudioFile, setAudioLoaded, setIsPlaying }: Methods = this;

            setAudioFile({ audioFile: null });
            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
        },
        playAudio(startTime: number) {
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
            audioPlayerEl.load();
            setIsPlaying({ playing: false });
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
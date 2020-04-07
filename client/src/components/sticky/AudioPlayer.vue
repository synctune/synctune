<template>
    <div id="AudioPlayer"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../utilities";
import { mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import CancellationToken from "../../utilities/CancellationToken";
import HighResolutionTimeout from '../../utilities/HighResolutionTimeout';
import ConnectionManager from '../../managers/ConnectionManager';

interface CachedPlaySignal {
    startLocation: number;
    startTime: number;
    receivedTime: number;
}

type Data = {
    currTimeUpdatorId: number | null;
    audioLoadCancellationToken: CancellationToken | null;
    cachedPlaySignal: CachedPlaySignal | null;
}

type Computed = {}
    & Pick<RoomStore.MapGettersStructure,
        | RoomStore.Getters.connectionManager
        | RoomStore.Getters.isConnected
    > 
    & Pick<AudioStore.MapGettersStructure,
        AudioStore.Getters.isPlaying 
        | AudioStore.Getters.audioContext
        | AudioStore.Getters.audioBuffer
        | AudioStore.Getters.audioSource
        | AudioStore.Getters.audioFile
        | AudioStore.Getters.audioLoaded
        | AudioStore.Getters.currentTime
        | AudioStore.Getters.startedAt
        | AudioStore.Getters.pausedAt
        | AudioStore.Getters.totalCompensation
    >;

type Methods = {
    setupConnectionManagerListeners(connectionManager: ConnectionManager): void;
    loadAudioFile(audioFile: Blob): void;
    unloadAudioFile(): void;
    playAudio(startLocation: number, startTime: number, instant: boolean): void;
    pauseAudio(): void;
    stopAudio(): void;
    onCanPlayThrough(): void;
    doPreloadFakeout(): void;
    runCachedPlaySignal(): void;
    startCurrTimeUpdator(): void;
    stopCurrTimeUpdator(): void;
} & Pick<AudioStore.MapActionsStructure,
    AudioStore.Actions.setIsPlaying
    | AudioStore.Actions.setAudioBuffer
    | AudioStore.Actions.setAudioSource
    | AudioStore.Actions.setAudioFile
    | AudioStore.Actions.setAudioFileMetadata
    | AudioStore.Actions.setAudioLoaded
    | AudioStore.Actions.setCurrentTime
    | AudioStore.Actions.setStartedAt
    | AudioStore.Actions.setPausedAt
>;


export default Vue.extend({
    data() {
        return {
            currTimeUpdatorId: null,
            audioLoadCancellationToken: null,
            cachedPlaySignal: null
        }
    },
    computed: {
        ...mapGetters({
            connectionManager: RoomStore.Getters.connectionManager,
            isConnected: RoomStore.Getters.isConnected,
            isPlaying: AudioStore.Getters.isPlaying,
            audioContext: AudioStore.Getters.audioContext,
            audioBuffer: AudioStore.Getters.audioBuffer,
            audioSource: AudioStore.Getters.audioSource,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
            currentTime: AudioStore.Getters.currentTime,
            startedAt: AudioStore.Getters.startedAt,
            pausedAt: AudioStore.Getters.pausedAt,
            totalCompensation: AudioStore.Getters.totalCompensation
        })
    },
    mounted() {
        const connectionManager = this.connectionManager as ConnectionManager;
        console.log("AudioPlayer: Setting up connection manager listeners", connectionManager); // TODO: remove
        const { setupConnectionManagerListeners }: Methods = this;
        setupConnectionManagerListeners(connectionManager);
    },
    methods: {
        ...mapActions({
            setIsPlaying: AudioStore.Actions.setIsPlaying,
            setAudioBuffer: AudioStore.Actions.setAudioBuffer,
            setAudioSource: AudioStore.Actions.setAudioSource,
            setAudioFile: AudioStore.Actions.setAudioFile,
            setAudioFileMetadata: AudioStore.Actions.setAudioFileMetadata,
            setAudioLoaded: AudioStore.Actions.setAudioLoaded,
            setCurrentTime: AudioStore.Actions.setCurrentTime,
            setStartedAt: AudioStore.Actions.setStartedAt,
            setPausedAt: AudioStore.Actions.setPausedAt,
        }),
        setupConnectionManagerListeners(connectionManager: ConnectionManager) {
            const { 
                loadAudioFile, 
                setAudioFileMetadata,
                unloadAudioFile, 
                playAudio, 
                pauseAudio, 
                stopAudio }: Methods = this;

            connectionManager.addEventListener("audiometadatasent", (metadata) => {
                setAudioFileMetadata({ audioFileMetadata: metadata });
            });

            connectionManager.addEventListener("audiometadatareceived", (metadata) => {
                setAudioFileMetadata({ audioFileMetadata: metadata });
            });

            connectionManager.addEventListener("audiofilesyncing", ({ audioFile, clients }) => {
                // Unload existing audiofile, if one is loaded
                unloadAudioFile();

                loadAudioFile(audioFile);
            });

            connectionManager.addEventListener("audiofilereceived", (audioFile) => {
                console.log("AudioPlayer: audiofilereceived");
                loadAudioFile(audioFile);
            });

            connectionManager.addEventListener("playsignalreceived", (data) => {
                playAudio(data.startLocation, data.startTime, data.instant);
            });

            connectionManager.addEventListener("pausesignalreceived", (sentTime) => {
                pauseAudio();
            });

            connectionManager.addEventListener("stopsignalreceived", (sentTime) => {
                stopAudio();
            });

            connectionManager.addEventListener("room-left", () => {
                stopAudio();
                unloadAudioFile();
            });

            connectionManager.addEventListener("timesyncchanged", (timesynced) => {
                if (timesynced == true) {
                    // Run the cached play signal, if it exists
                    const { runCachedPlaySignal }: Methods = this;
                    runCachedPlaySignal();
                }
            });
        },
        loadAudioFile(audioFile: Blob) {
            const { audioLoadCancellationToken }: Data = this;
            const { audioContext }: Computed = this;
            const { 
                setAudioFile, 
                setAudioLoaded, 
                setAudioBuffer,
                setIsPlaying, 
                onCanPlayThrough,
                setStartedAt,
                setPausedAt,
                doPreloadFakeout,
                runCachedPlaySignal }: Methods = this;

            setAudioFile({ audioFile });

            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
            setStartedAt({ startedAt: 0 });
            setPausedAt({ pausedAt: 0 });

            // If there is another audio file already loading, then attempt to cancel it
            if (audioLoadCancellationToken) {
                audioLoadCancellationToken.requestCancellation();
            }

            // Setup our own cancellation token and override the old one
            const cancellationToken = new CancellationToken();
            this.audioLoadCancellationToken = cancellationToken;

            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(audioFile);

            fileReader.addEventListener("load", (event) => {
                const arrBuffer = event.target?.result as ArrayBuffer;

                audioContext.decodeAudioData(arrBuffer, (audioBuffer) => {
                    // If a cancellation was requested, then oblige and don't load the audio
                    if (cancellationToken.requestedCancellation) {
                        console.log("CANCELLATION REQUESTED, CANCELLING"); // TODO: remove
                        cancellationToken.completedCancellation();
                        return;
                    }

                    setAudioBuffer({ audioBuffer: audioBuffer });
                    setAudioLoaded({ loaded: true });

                    // This is meant to stop a bug where a massive amount of delay occurs when
                    // playing an audio clip for the first time
                    doPreloadFakeout();


                    // Send ready to play signal
                    const connectionManager = this.connectionManager as ConnectionManager;
                    if (!connectionManager.isOwner) {
                        connectionManager.sendReadyToPlaySignal(connectionManager.id!);

                        // Run the cached play signal, if it exists
                        runCachedPlaySignal();
                    }
                });
            });
        },
        unloadAudioFile() {
            const { audioSource }: Computed = this;
            const { 
                setAudioSource,
                setAudioFile, 
                setAudioFileMetadata, 
                setAudioLoaded, 
                setIsPlaying, 
                onCanPlayThrough, 
                setStartedAt, 
                setPausedAt }: Methods = this;

            if (audioSource) {
                audioSource.disconnect();
                setAudioSource({ audioSource: null });
            }

            setAudioFile({ audioFile: null });
            setAudioFileMetadata({ audioFileMetadata: null });
            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
            setStartedAt({ startedAt: 0 });
            setPausedAt({ pausedAt: 0 });
        },
        runCachedPlaySignal() {
            const { cachedPlaySignal }: Data = this;
            const { playAudio }: Methods = this;

            if (cachedPlaySignal) {
                console.log("Playing cached play signal", cachedPlaySignal); // TODO: remove
                playAudio(cachedPlaySignal.startLocation, cachedPlaySignal.startTime, false);
            }
        },
        async playAudio(startLocation: number, startTime: number, instant: boolean) {
            console.log("Received play signal", startLocation); // TODO: remove

            const { cachedPlaySignal }: Data = this;
            const { audioContext, audioBuffer, audioLoaded, audioSource }: Computed = this;
            const connectionManager = this.connectionManager as ConnectionManager;
            const { 
                setAudioSource, 
                setIsPlaying, 
                setStartedAt, 
                setPausedAt, 
                doPreloadFakeout, 
                startCurrTimeUpdator,
                stopAudio }: Methods = this;

            if (!audioLoaded || !(connectionManager.timesynced || !connectionManager.hasClients)) {
                console.warn("Unable to play, audio file not loaded / time not synced... caching"); // TODO: remove

                // Cache the play signal
                const newCachedPlaySignal: CachedPlaySignal = {
                    startLocation,
                    startTime,
                    receivedTime: connectionManager.now()
                };

                this.cachedPlaySignal = newCachedPlaySignal;

                return;
            }

            // Clear cached play signal
            this.cachedPlaySignal = null;

            doPreloadFakeout();

            const prevAudioSource = audioSource;

            const newAudioSource = audioContext.createBufferSource();
            newAudioSource.buffer = audioBuffer;
            newAudioSource.connect(audioContext.destination);

            // Note: do NOT use addEventListener here, it is intentional that we
            // want only one event handler here so it is able to be removed later on
            newAudioSource.onended = () => {
                const { isPlaying }: Computed = this;

                // If the song ended on its own accord
                if (isPlaying) {
                    stopAudio();
                }
            };

            setAudioSource({ audioSource: newAudioSource });
            let offset = startLocation;

            // Overshoot is the amount of milliseconds we overshot the target delay by
            const startAudio = (overshoot = 0) => {
                const { totalCompensation, audioBuffer }: Computed = this;
                console.log(">> Playing audio at", offset, "with overshoot", overshoot); // TODO: remove

                // Stop any audio that may be already playing
                if (prevAudioSource) {
                    prevAudioSource.onended = () => {};
                    prevAudioSource.disconnect();
                    prevAudioSource.stop();
                }

                // Start the audio from the given offset, accounting for any overshoot and manual compensation
                const startTime = Math.max(offset + (overshoot / 1000) + totalCompensation, 0);
                newAudioSource.start(0, startTime);

                setStartedAt({ startedAt: audioContext.currentTime - offset });
                setPausedAt({ pausedAt: 0 });

                setIsPlaying({ playing: true });

                startCurrTimeUpdator();
            }

            if (instant) {
                startAudio();
            } else {
                const startDelay = startTime - connectionManager.now();
                // If we received a start time that already passed
                if (startDelay <= 0) {
                    // We need to attempt to make up for it by seeking forward by 
                    // however much time we missed
                    offset += -1 * (startDelay / 1000);

                    startAudio();
                } 
                // Otherwise we need to wait until the our time reaches the start time
                else {
                    const timeout = new HighResolutionTimeout(startDelay, (overshoot) => {
                        startAudio(overshoot);
                    });
                    timeout.start();
                }
            }
        },
        async pauseAudio() {
            const { audioContext }: Computed = this;
            const { startedAt }: Computed = this;
            const { setIsPlaying, stopAudio, setPausedAt }: Methods = this;

            const elapsedTime = audioContext.currentTime - startedAt;
            setPausedAt({ pausedAt: elapsedTime });
            stopAudio();
        },
        stopAudio() {
            const { audioSource }: Computed = this;
            const { 
                setAudioSource, 
                setIsPlaying, 
                setStartedAt, 
                setPausedAt, 
                stopCurrTimeUpdator }: Methods = this;

            
            setIsPlaying({ playing: false });
            stopCurrTimeUpdator();

            if (audioSource) {
                audioSource.onended = () => {};
                audioSource.disconnect();
                // To handle if we never started the audio
                // e.g. disconnecting from room without ever playing audio
                try {
                    audioSource.stop(0);
                } catch(err){}

                setAudioSource({ audioSource: null });
            }
        },
        onCanPlayThrough() { // TODO: remove
            const { setAudioLoaded }: Methods = this;
            console.log("canplaythrough audio file"); // TODO: remove
            setAudioLoaded({ loaded: true });
        },
        doPreloadFakeout() {
            const { audioContext, audioBuffer }: Computed = this;

            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioContext.destination);
            audioSource.start();
            audioSource.stop();
            audioSource.disconnect();

            console.log("AudioPlayer: Doing preload fakeout"); // TODO: remove
        },
        startCurrTimeUpdator() {
            const { currTimeUpdatorId }: Data = this;
            const { audioContext, audioBuffer, startedAt }: Computed = this;
            const { setCurrentTime }: Methods = this;

            // Stop the existing time updator interval, if one is running
            if (currTimeUpdatorId) {
                clearInterval(currTimeUpdatorId);
            }

            function updateCurrTime() {
                const currTime = audioContext.currentTime - startedAt;

                // Don't update if we've hit the end of the song
                if (!audioBuffer || currTime > audioBuffer.duration) {
                    return;
                }

                setCurrentTime({ currentTime: currTime });
            }

            // Update the current time tracker every second
            updateCurrTime();
            this.currTimeUpdatorId = setInterval(updateCurrTime, 1000);
        },
        stopCurrTimeUpdator() {
            const { currTimeUpdatorId }: Data = this;
            const { pausedAt }: Computed = this;
            const { setCurrentTime }: Methods = this;

            // Stop the existing time updator interval, if one is running
            if (currTimeUpdatorId) {
                clearInterval(currTimeUpdatorId);
                setCurrentTime({ currentTime: pausedAt });
                this.currTimeUpdatorId = null;
            }
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
        }
    }
});
</script>

<style lang="scss" scoped>
    #AudioPlayer {
        position: absolute;
    }
</style>
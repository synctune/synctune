<template>
    <div id="AudioPlayer"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from "vuex";
import * as RoomStore from "../../store/modules/room";
import * as AudioStore from "../../store/modules/audio";
import CancellationToken from "../../utilities/CancellationToken";
import HighResolutionTimeout from '../../utilities/HighResolutionTimeout';
import ConnectionManager from '../../rtc/ConnectionManager';

interface CachedPlaySignal {
    startLocation: number;
    startTime: number;
    receivedTime: number;
}

type Data = {
    audioContext: AudioContext;
    audioSource: AudioBufferSourceNode | null;
    audioBuffer: AudioBuffer | null;
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
        | AudioStore.Getters.audioFile
        | AudioStore.Getters.audioLoaded
        | AudioStore.Getters.syncedClients
        | AudioStore.Getters.startedAt
        | AudioStore.Getters.pausedAt
    >;

type Methods = {
    setupConnectionManagerListeners(connectionManager: ConnectionManager): void;
    loadAudioFile(audioFile: Blob): void;
    unloadAudioFile(): void;
    playAudio(startLocation: number, startTime: number): void;
    pauseAudio(): void;
    stopAudio(): void;
    clientSynced(clientId: string): void;
    clientLeft(clientId: string): void;
    removeClientsFromSyncList(clients?: string[]): void;
    onCanPlayThrough(): void;
    doPreloadFakeout(): void;
    runCachedPlaySignal(): void;
} & Pick<AudioStore.MapActionsStructure,
    AudioStore.Actions.setIsPlaying
    | AudioStore.Actions.setAudioFile
    | AudioStore.Actions.setAudioFileMetadata
    | AudioStore.Actions.setAudioLoaded
    | AudioStore.Actions.setSyncedClients
    | AudioStore.Actions.setStartedAt
    | AudioStore.Actions.setPausedAt
>;


export default Vue.extend({
    data() {
        return {
            audioContext: new AudioContext(),
            audioSource: null,
            audioBuffer: null,
            audioLoadCancellationToken: null,
            cachedPlaySignal: null
        }
    },
    computed: {
        ...mapGetters({
            connectionManager: RoomStore.Getters.connectionManager,
            isConnected: RoomStore.Getters.isConnected,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
            syncedClients: AudioStore.Getters.syncedClients,
            startedAt: AudioStore.Getters.startedAt,
            pausedAt: AudioStore.Getters.pausedAt,
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
            setAudioFile: AudioStore.Actions.setAudioFile,
            setAudioFileMetadata: AudioStore.Actions.setAudioFileMetadata,
            setAudioLoaded: AudioStore.Actions.setAudioLoaded,
            setSyncedClients: AudioStore.Actions.setSyncedClients,
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
                stopAudio,
                clientSynced, 
                removeClientsFromSyncList, 
                clientLeft }: Methods = this;

            connectionManager.addEventListener("audiometadatasent", (metadata) => {
                setAudioFileMetadata({ audioFileMetadata: metadata });
            });

            connectionManager.addEventListener("audiometadatareceived", (metadata) => {
                setAudioFileMetadata({ audioFileMetadata: metadata });
            });

            connectionManager.addEventListener("audiofilesyncing", ({ audioFile, clients }) => {
                // Unload existing audiofile, if one is loaded
                unloadAudioFile();

                removeClientsFromSyncList(clients);
                loadAudioFile(audioFile);
            });

            connectionManager.addEventListener("audiofilereceived", (audioFile) => {
                loadAudioFile(audioFile);
            });

            connectionManager.addEventListener("playsignalreceived", (data) => {
                playAudio(data.startLocation, data.startTime);
            });

            connectionManager.addEventListener("pausesignalreceived", (sentTime) => {
                pauseAudio();
            });

            connectionManager.addEventListener("stopsignalreceived", (sentTime) => {
                stopAudio();
            });

            connectionManager.addEventListener("clientreadytoplay", clientId => {
                if (connectionManager.isOwner) {
                    clientSynced(clientId);
                }
            });

            connectionManager.addEventListener("room-left", () => {
                stopAudio();
                removeClientsFromSyncList();
                unloadAudioFile();
            });

            connectionManager.addEventListener("client-left", ({ clientId }) => {
                clientLeft(clientId);
            });

            connectionManager.addEventListener("timesyncchanged", (timesynced) => {
                if (timesynced) {
                    // Run the cached play signal, if it exists
                    const { runCachedPlaySignal }: Methods = this;
                    runCachedPlaySignal();
                }
            });
        },
        loadAudioFile(audioFile: Blob) {
            const { audioContext, audioLoadCancellationToken }: Data = this;
            const { 
                setAudioFile, 
                setAudioLoaded, 
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

                    this.audioBuffer = audioBuffer;
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
            const { audioContext, audioSource }: Data = this;
            const { 
                setAudioFile, 
                setAudioFileMetadata, 
                setAudioLoaded, 
                setIsPlaying, 
                onCanPlayThrough, 
                setStartedAt, 
                setPausedAt }: Methods = this;

            if (audioSource) {
                audioSource.disconnect();
                this.audioSource = null;
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
                playAudio(cachedPlaySignal.startLocation, cachedPlaySignal.startTime);
            }
        },
        async playAudio(startLocation: number, startTime: number) {
            // TODO: delay the start time using the synchronized time
            // TODO: handle if audio has not been loaded yet

            console.log("Received play signal", startLocation); // TODO: remove

            const { audioContext, audioBuffer, cachedPlaySignal }: Data = this;
            const { audioLoaded, pausedAt }: Computed = this;
            const connectionManager = this.connectionManager as ConnectionManager;
            const { setIsPlaying, setStartedAt, setPausedAt, doPreloadFakeout }: Methods = this;

            if (!audioLoaded || !connectionManager.timesynced) {
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

            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioContext.destination);

            this.audioSource = audioSource;
            let offset = pausedAt;

            // Ignore locally saved pause location if not the room owner
            if (!connectionManager.isOwner) {
                offset = startLocation;
            }

            // Overshoot is the amount of milliseconds we overshot the target delay by
            const startAudio = (overshoot = 0) => {
                console.log(">> Playing audio at", offset, "with overshoot", overshoot); // TODO: remove

                // Start the audio from the given offset, accounting for any overshoot
                audioSource.start(0, offset + (overshoot / 1000));

                setStartedAt({ startedAt: audioContext.currentTime - offset });
                setPausedAt({ pausedAt: 0 });

                setIsPlaying({ playing: true });
            }

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
        },
        async pauseAudio() {
            const { audioSource, audioContext }: Data = this;
            const { startedAt }: Computed = this;
            const { setIsPlaying, stopAudio, setPausedAt }: Methods = this;

            const elapsedTime = audioContext.currentTime - startedAt;
            stopAudio();
            setPausedAt({ pausedAt: elapsedTime });
        },
        stopAudio() {
            const { audioSource }: Data = this;
            const { setIsPlaying, setStartedAt, setPausedAt }: Methods = this;

            if (audioSource) {
                audioSource.disconnect();
                // To handle if we never started the audio
                // e.g. disconnecting from room without ever playing audio
                try {
                    audioSource.stop(0);
                } catch(err){}
                this.audioSource = null;
            }

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
        removeClientsFromSyncList(clients?: string[]) {
            const { syncedClients }: Computed = this;
            const { setSyncedClients }: Methods = this;

            // Remove all clients, if none are specified
            const newSyncedClients = (clients) ? syncedClients.filter((clientID) => !clients.includes(clientID)) : [];
        
            setSyncedClients({ syncedClients: newSyncedClients });
        },
        onCanPlayThrough() { // TODO: remove
            const { setAudioLoaded }: Methods = this;
            console.log("canplaythrough audio file"); // TODO: remove
            setAudioLoaded({ loaded: true });
        },
        doPreloadFakeout() {
            const { audioBuffer, audioContext }: Data = this;

            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioContext.destination);
            audioSource.start();
            audioSource.stop();

            console.log("AudioPlayer: Doing preload fakeout"); // TODO: remove
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

    }
</style>
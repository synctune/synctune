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
import CancellationToken from "../../utilities/CancellationToken";
import HighResolutionTimeout from '../../utilities/HighResolutionTimeout';

type Data = {
    audioContext: AudioContext;
    audioSource: AudioBufferSourceNode | null;
    audioBuffer: AudioBuffer | null;
    // startedAt: number;
    // pausedAt: number;
    audioLoadCancellationToken: CancellationToken | null;
    firstPlay: boolean;
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
        | AudioStore.Getters.startedAt
        | AudioStore.Getters.pausedAt
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
    removeClientsFromSyncList(clients?: string[]): void;
    onCanPlayThrough(): void;
    doPreloadFakeout(): void;
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
            // startedAt: 0,
            // pausedAt: 0,
            audioLoadCancellationToken: null,
            firstPlay: true
        }
    },
    computed: {
        ...mapGetters({
            roomManager: RoomStore.Getters.roomManager,
            isConnected: RoomStore.Getters.isConnected,
            isPlaying: AudioStore.Getters.isPlaying,
            audioFile: AudioStore.Getters.audioFile,
            audioLoaded: AudioStore.Getters.audioLoaded,
            syncedClients: AudioStore.Getters.syncedClients,
            startedAt: AudioStore.Getters.startedAt,
            pausedAt: AudioStore.Getters.pausedAt,
        })
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
        setupRoomManagerListeners(roomManager: RoomManager) {
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

            roomManager.addEventListener("audiometadatasent", (metadata) => {
                setAudioFileMetadata({ audioFileMetadata: metadata });
            });

            roomManager.addEventListener("audiofilesyncing", ({ audioFile, clients }) => {
                // Unload existing audiofile, if one is loaded
                unloadAudioFile();

                removeClientsFromSyncList(clients);
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
                removeClientsFromSyncList();
                unloadAudioFile();
            });

            signallingSocket.on("client-left", (_, clientId: string) => {
                clientLeft(clientId);
            });
        },
        loadAudioFile(audioFile: Blob) {
            const { audioContext, audioLoadCancellationToken, firstPlay }: Data = this;
            const { 
                setAudioFile, 
                setAudioLoaded, 
                setIsPlaying, 
                onCanPlayThrough,
                setStartedAt,
                setPausedAt,
                doPreloadFakeout }: Methods = this;

            setAudioFile({ audioFile });

            setAudioLoaded({ loaded: false });
            setIsPlaying({ playing: false });
            setStartedAt({ startedAt: 0 });
            setPausedAt({ pausedAt: 0 });
            // this.startedAt = 0;
            // this.pausedAt = 0;

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

                    // If this is our first time playing, quickly play and stop the audio
                    // This is meant to stop a bug where a massive amount of delay occurs when
                    // playing an audio clip for the first time
                    if (firstPlay) {
                        doPreloadFakeout();
                        this.firstPlay = false;
                    }

                    // Send ready to play signal
                    const roomManager = this.roomManager as RoomManager;
                    if (!roomManager.isOwner) {
                        const peerManager = roomManager.peerManager as PeerManager;
                        peerManager!.sendReadyToPlaySignal(roomManager.id!);
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
            // this.startedAt = 0;
            // this.pausedAt = 0;
        },
        async playAudio(startLocation: number, startTime: number) {
            // TODO: delay the start time using the synchronized time
            // TODO: handle if audio has not been loaded yet

            console.log("Received play signal", startLocation); // TODO: remove

            const { audioContext, audioBuffer }: Data = this;
            const { audioLoaded, pausedAt }: Computed = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            const { setIsPlaying, setStartedAt, setPausedAt }: Methods = this;

            if (!audioLoaded) {
                console.warn("Unable to play, audio file not loaded"); // TODO: remove
                return;
            }

            if (!peerManager) {
                console.log("Peermanager not connected"); // TODO: remove
                return;
            }

            const timesync = peerManager.timesync;

            const audioSource = audioContext.createBufferSource();
            audioSource.buffer = audioBuffer;
            audioSource.connect(audioContext.destination);

            this.audioSource = audioSource;
            let offset = pausedAt;

            // TODO: put this in
            // Ignore locally saved pause location if not the room owner
            if (!roomManager.isOwner) {
                offset = startLocation;
            }

            const startAudio = (overshoot = 0) => {
                console.log(">> Playing audio at", offset, "with overshoot", overshoot); // TODO: remove
                audioSource.start(0, offset);

                setStartedAt({ startedAt: audioContext.currentTime - offset });
                setPausedAt({ pausedAt: 0 });

                // this.startedAt = audioContext.currentTime - offset;
                // this.pausedAt = 0;

                setIsPlaying({ playing: true });
            }

            const startDelay = startTime - timesync.now();
            // If we received a start time that already passed
            if (startDelay <= 0) {
                console.log("Playing audio from here")
                // We need to attempt to make up for it by seeking forward by 
                // however much time we missed
                offset += -1 * startDelay;

                startAudio();
            } 
            // Otherwise we need to wait until the our time reaches the start time
            else {
                const timeout = new HighResolutionTimeout(startDelay, (overshoot) => {
                    startAudio(overshoot);
                });
                timeout.start();

                // TODO: get the high-precision timer working
                // setTimeout(startAudio, startDelay);
            }
        },
        async pauseAudio() {
            const { audioSource, audioContext }: Data = this;
            const { startedAt }: Computed = this;
            const { setIsPlaying, stopAudio, setPausedAt }: Methods = this;

            const elapsedTime = audioContext.currentTime - startedAt;
            stopAudio();
            setPausedAt({ pausedAt: elapsedTime });
            // this.pausedAt = elapsedTime;
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

            // this.startedAt = 0;
            // this.pausedAt = 0;
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
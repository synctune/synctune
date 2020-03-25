import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import { RootState } from "../../index";
import { AudioFileMetadata } from "@/rtc/RoomManager";

// -------------------------
// --- Type Declarations ---
// -------------------------

interface AudioFilePayload {
    audioFile: Blob | null;
}

interface AudioFileMetadataPayload {
    audioFileMetadata: AudioFileMetadata | null;
}

interface AudioLoadedPayload {
    loaded: boolean;
}

interface IsPlayingPayload {
    playing: boolean;
}

interface SyncClientsPayload {
    syncedClients: string[];
}

interface StartedAtPayload {
    startedAt: number;
}

interface PausedAtPayload {
    pausedAt: number;
}

export interface AudioState {
    isPlaying: boolean;
    audioFile: Blob | null;
    audioFileMetadata: AudioFileMetadata | null;
    audioLoaded: boolean;
    syncedClients: string[];
    startedAt: number;
    pausedAt: number;
}

export enum Getters {
    isPlaying = "isPlaying",
    audioFile = "audioFile",
    audioFileMetadata = "audioFileMetadata",
    audioLoaded = "audioLoaded",
    syncedClients = "syncedClients",
    startedAt = "startedAt",
    pausedAt = "pausedAt"
}

export enum Mutations {
    setIsPlaying = "setIsPlaying",
    setAudioFile = "setAudioFile",
    setAudioFileMetadata = "setAudioFileMetadata",
    setAudioLoaded = "setAudioLoaded",
    setSyncedClients = "setSyncedClients",
    setStartedAt = "setStartedAt",
    setPausedAt = "setPausedAt"
}

export enum Actions {
    setIsPlaying = "setIsPlaying",
    setAudioFile = "setAudioFile",
    setAudioFileMetadata = "setAudioFileMetadata",
    setAudioLoaded = "setAudioLoaded",
    setSyncedClients = "setSyncedClients",
    setStartedAt = "setStartedAt",
    setPausedAt = "setPausedAt"
}

export interface MapGettersStructure {
    [Getters.isPlaying]: boolean;
    [Getters.audioFile]: Blob | null;
    [Getters.audioFileMetadata]: AudioFileMetadata | null;
    [Getters.audioLoaded]: boolean;
    [Getters.syncedClients]: string[];
    [Getters.startedAt]: number;
    [Getters.pausedAt]: number;
}

export interface MapMutationsStructure {
    [Mutations.setIsPlaying](payload: IsPlayingPayload): void;
    [Mutations.setAudioFile](payload: AudioFilePayload): void;
    [Mutations.setAudioFileMetadata](payload: AudioFileMetadataPayload): void;
    [Mutations.setAudioLoaded](payload: AudioLoadedPayload): void;
    [Mutations.setSyncedClients](payload: SyncClientsPayload): void;
    [Mutations.setStartedAt](payload: StartedAtPayload): void;
    [Mutations.setPausedAt](payload: PausedAtPayload): void;
}

export interface MapActionsStructure {
    [Actions.setIsPlaying](payload: IsPlayingPayload): void;
    [Actions.setAudioFile](payload: AudioFilePayload): void;
    [Actions.setAudioFileMetadata](payload: AudioFileMetadataPayload): void;
    [Actions.setAudioLoaded](payload: AudioLoadedPayload): void;
    [Actions.setSyncedClients](payload: SyncClientsPayload): void;
    [Actions.setStartedAt](payload: StartedAtPayload): void;
    [Actions.setPausedAt](payload: PausedAtPayload): void;
}

// -------------------
// --- Audio Store ---
// -------------------

const namespaced = false;

const state: AudioState = {
    isPlaying: false,
    audioFile: null,
    audioFileMetadata: null,
    audioLoaded: false,
    syncedClients: [],
    startedAt: 0,
    pausedAt: 0
};

const getters: GetterTree<AudioState, RootState> = {
    [Getters.isPlaying](state): boolean {
        return state.isPlaying;
    },
    [Getters.audioFile](state): Blob | null {
        return state.audioFile;
    },
    [Getters.audioFileMetadata](state): AudioFileMetadata | null {
        return state.audioFileMetadata;
    },
    [Getters.audioLoaded](state): boolean {
        return state.audioLoaded;
    },
    [Getters.syncedClients](state): string[] {
        return [...state.syncedClients];
    },
    [Getters.startedAt](state): number {
        return state.startedAt;
    },
    [Getters.pausedAt](state): number {
        return state.pausedAt;
    }
};

const mutations: MutationTree<AudioState> = {
    [Mutations.setIsPlaying](state, { playing }: IsPlayingPayload) {
        Vue.set(state, "isPlaying", playing);
    },
    [Mutations.setAudioFile](state, { audioFile }: AudioFilePayload) {
        Vue.set(state, "audioFile", audioFile);
    },
    [Mutations.setAudioFileMetadata](state, { audioFileMetadata }: AudioFileMetadataPayload) {
        Vue.set(state, "audioFileMetadata", audioFileMetadata);
    },
    [Mutations.setAudioLoaded](state, { loaded }: AudioLoadedPayload) {
        Vue.set(state, "audioLoaded", loaded);
    },
    [Mutations.setSyncedClients](state, { syncedClients }: SyncClientsPayload) {
        Vue.set(state, "syncedClients", syncedClients);
    },
    [Mutations.setStartedAt](state, { startedAt }: StartedAtPayload) {
        Vue.set(state, "startedAt", startedAt);
    },
    [Mutations.setPausedAt](state, { pausedAt }: PausedAtPayload) {
        Vue.set(state, "pausedAt", pausedAt);
    },
};

const actions: ActionTree<AudioState, RootState> = {
    [Actions.setIsPlaying]({ commit }, payload: IsPlayingPayload) {
        commit(Mutations.setIsPlaying, payload);
    },
    [Actions.setAudioFile]({ commit }, payload: AudioFilePayload) {
        commit(Mutations.setAudioFile, payload);
    },
    [Actions.setAudioFileMetadata]({ commit }, payload: AudioFileMetadataPayload) {
        commit(Mutations.setAudioFileMetadata, payload);
    },
    [Actions.setAudioLoaded]({ commit }, payload: AudioLoadedPayload) {
        commit(Mutations.setAudioLoaded, payload);
    }, 
    [Actions.setSyncedClients]({ commit }, payload: SyncClientsPayload) {
        commit(Mutations.setSyncedClients, payload);
    },
    [Actions.setStartedAt]({ commit }, payload: StartedAtPayload) {
        commit(Mutations.setStartedAt, payload);
    },
    [Actions.setPausedAt]({ commit }, payload: PausedAtPayload) {
        commit(Mutations.setPausedAt, payload);
    },
};

const storeModule: Module<AudioState, RootState> = {
    namespaced,
    state,
    getters,
    mutations,
    actions
};

export default storeModule;
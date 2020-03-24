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

export interface AudioState {
    isPlaying: boolean;
    audioFile: Blob | null;
    audioFileMetadata: AudioFileMetadata | null;
    audioLoaded: boolean;
    syncedClients: string[];
}

export enum Getters {
    isPlaying = "isPlaying",
    audioFile = "audioFile",
    audioFileMetadata = "audioFileMetadata",
    audioLoaded = "audioLoaded",
    syncedClients = "syncedClients"
}

export enum Mutations {
    setIsPlaying = "setIsPlaying",
    setAudioFile = "setAudioFile",
    setAudioFileMetadata = "setAudioFileMetadata",
    setAudioLoaded = "setAudioLoaded",
    setSyncedClients = "setSyncedClients"
}

export enum Actions {
    setIsPlaying = "setIsPlaying",
    setAudioFile = "setAudioFile",
    setAudioFileMetadata = "setAudioFileMetadata",
    setAudioLoaded = "setAudioLoaded",
    setSyncedClients = "setSyncedClients"
}

export interface MapGettersStructure {
    [Getters.isPlaying]: boolean;
    [Getters.audioFile]: Blob | null;
    [Getters.audioFileMetadata]: AudioFileMetadata | null;
    [Getters.audioLoaded]: boolean;
    [Getters.syncedClients]: string[];
}

export interface MapMutationsStructure {
    [Mutations.setIsPlaying](payload: IsPlayingPayload): void;
    [Mutations.setAudioFile](payload: AudioFilePayload): void;
    [Mutations.setAudioFileMetadata](payload: AudioFileMetadataPayload): void;
    [Mutations.setAudioLoaded](payload: AudioLoadedPayload): void;
    [Mutations.setSyncedClients](payload: SyncClientsPayload): void;
}

export interface MapActionsStructure {
    [Actions.setIsPlaying](payload: IsPlayingPayload): void;
    [Actions.setAudioFile](payload: AudioFilePayload): void;
    [Actions.setAudioFileMetadata](payload: AudioFileMetadataPayload): void;
    [Actions.setAudioLoaded](payload: AudioLoadedPayload): void;
    [Actions.setSyncedClients](payload: SyncClientsPayload): void;
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
    syncedClients: []
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
    }
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
    }
};

const storeModule: Module<AudioState, RootState> = {
    namespaced,
    state,
    getters,
    mutations,
    actions
};

export default storeModule;
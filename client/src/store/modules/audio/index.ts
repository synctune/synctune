import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import RoomManager from '@/rtc/RoomManager';
import { RootState } from "../../index";

// -------------------------
// --- Type Declarations ---
// -------------------------

interface AudioFilePayload {
    audioFile: Blob | null;
}

interface AudioLoadedPayload {
    loaded: boolean;
}

interface IsPlayingPayload {
    playing: boolean;
}

export interface AudioState {
    isPlaying: boolean;
    audioFile: Blob | null;
    audioLoaded: boolean;
}

export enum Getters {
    isPlaying = "isPlaying",
    audioFile = "audioFile",
    audioLoaded = "audioLoaded"
}

export enum Mutations {
    setIsPlaying = "setIsPlaying",
    setAudioFile = "setAudioFile",
    setAudioLoaded = "setAudioLoaded"
}

export enum Actions {
    setIsPlaying = "setIsPlaying",
    setAudioFile = "setAudioFile",
    setAudioLoaded = "setAudioLoaded"
}

export interface MapGettersStructure {
    [Getters.isPlaying]: boolean;
    [Getters.audioFile]: Blob | null;
    [Getters.audioLoaded]: boolean;
}

export interface MapMutationsStructure {
    [Mutations.setIsPlaying](payload: IsPlayingPayload): void;
    [Mutations.setAudioFile](payload: AudioFilePayload): void;
    [Mutations.setAudioLoaded](payload: AudioLoadedPayload): void;
}

export interface MapActionsStructure {
    [Actions.setIsPlaying](payload: IsPlayingPayload): void;
    [Actions.setAudioFile](payload: AudioFilePayload): void;
    [Actions.setAudioLoaded](payload: AudioLoadedPayload): void;
}

// -------------------
// --- Audio Store ---
// -------------------

const namespaced = false;

const state: AudioState = {
    isPlaying: false,
    audioFile: null,
    audioLoaded: false
};

const getters: GetterTree<AudioState, RootState> = {
    [Getters.isPlaying](state): boolean {
        return state.isPlaying;
    },
    [Getters.audioFile](state): Blob | null {
        return state.audioFile;
    },
    [Getters.audioLoaded](state): boolean {
        return state.audioLoaded;
    }
};

const mutations: MutationTree<AudioState> = {
    [Mutations.setIsPlaying](state, { playing }: IsPlayingPayload) {
        Vue.set(state, "isPlaying", playing);
    },
    [Mutations.setAudioFile](state, { audioFile }: AudioFilePayload) {
        Vue.set(state, "audioFile", audioFile);
    },
    [Mutations.setAudioLoaded](state, { loaded }: AudioLoadedPayload) {
        Vue.set(state, "audioLoaded", loaded);
    }
};

const actions: ActionTree<AudioState, RootState> = {
    [Mutations.setIsPlaying]({ commit }, payload: IsPlayingPayload) {
        commit(Mutations.setIsPlaying, payload);
    },
    [Mutations.setAudioFile]({ commit }, payload: AudioFilePayload) {
        commit(Mutations.setAudioFile, payload);
    },
    [Mutations.setAudioLoaded]({ commit }, payload: AudioLoadedPayload) {
        commit(Mutations.setAudioLoaded, payload);
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
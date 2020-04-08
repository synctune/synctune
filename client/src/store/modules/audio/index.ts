import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import { RootState } from "../../index";
import { AudioFileMetadata } from '@/managers/ConnectionManager';

// -------------------------
// --- Type Declarations ---
// -------------------------

// --- Payloads ---
interface AudioBufferPayload {
    audioBuffer: AudioBuffer | null;
}

interface AudioSourcePayload {
    audioSource: AudioBufferSourceNode | null;
}

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

interface AudioContextPayload {
    audioContext: AudioContext;
}

interface CurrentTimePayload {
    currentTime: number;
}

interface StartedAtPayload {
    startedAt: number;
}

interface PausedAtPayload {
    pausedAt: number;
}

interface TotalCompensationPayload {
    totalCompensation: number;
}

// --- Store Type Declarations ---

export interface AudioState {
    isPlaying: boolean;
    audioContext: AudioContext;
    audioBuffer: AudioBuffer | null;
    audioSource: AudioBufferSourceNode | null;
    audioFile: Blob | null;
    audioFileMetadata: AudioFileMetadata | null;
    audioLoaded: boolean;
    currentTime: number;
    startedAt: number;
    pausedAt: number;
    totalCompensation: number;
}

export enum Getters {
    isPlaying = "isPlaying",
    audioContext = "audioContext",
    audioBuffer = "audioBuffer",
    audioSource = "audioSource",
    audioFile = "audioFile",
    audioFileMetadata = "audioFileMetadata",
    audioLoaded = "audioLoaded",
    currentTime = "currentTime",
    startedAt = "startedAt",
    pausedAt = "pausedAt",
    totalCompensation = "totalCompensation"
}

export enum Mutations {
    setIsPlaying = "setIsPlaying",
    setAudioContext = "setAudioContext",
    setAudioBuffer = "setAudioBuffer",
    setAudioSource = "setAudioSource",
    setAudioFile = "setAudioFile",
    setAudioFileMetadata = "setAudioFileMetadata",
    setAudioLoaded = "setAudioLoaded",
    setCurrentTime = "setCurrentTime",
    setStartedAt = "setStartedAt",
    setPausedAt = "setPausedAt",
    setTotalCompensation = "setTotalCompensation"
}

export enum Actions {
    setIsPlaying = "setIsPlaying",
    setAudioContext = "setAudioContext",
    setAudioBuffer = "setAudioBuffer",
    setAudioSource = "setAudioSource",
    setAudioFile = "setAudioFile",
    setAudioFileMetadata = "setAudioFileMetadata",
    setAudioLoaded = "setAudioLoaded",
    setCurrentTime = "setCurrentTime",
    setStartedAt = "setStartedAt",
    setPausedAt = "setPausedAt",
    setTotalCompensation = "setTotalCompensation"
}

export interface MapGettersStructure {
    [Getters.isPlaying]: boolean;
    [Getters.audioContext]: AudioContext;
    [Getters.audioBuffer]: AudioBuffer | null;
    [Getters.audioSource]: AudioBufferSourceNode | null;
    [Getters.audioFile]: Blob | null;
    [Getters.audioFileMetadata]: AudioFileMetadata | null;
    [Getters.audioLoaded]: boolean;
    [Getters.currentTime]: number;
    [Getters.startedAt]: number;
    [Getters.pausedAt]: number;
    [Getters.totalCompensation]: number;
}

export interface MapMutationsStructure {
    [Mutations.setIsPlaying](payload: IsPlayingPayload): void;
    [Mutations.setAudioContext](payload: AudioContextPayload): void;
    [Mutations.setAudioBuffer](payload: AudioBufferPayload): void;
    [Mutations.setAudioSource](payload: AudioSourcePayload ): void;
    [Mutations.setAudioFile](payload: AudioFilePayload): void;
    [Mutations.setAudioFileMetadata](payload: AudioFileMetadataPayload): void;
    [Mutations.setAudioLoaded](payload: AudioLoadedPayload): void;
    [Mutations.setCurrentTime](payload: CurrentTimePayload): void;
    [Mutations.setStartedAt](payload: StartedAtPayload): void;
    [Mutations.setPausedAt](payload: PausedAtPayload): void;
    [Mutations.setTotalCompensation](payload: TotalCompensationPayload): void;
}

export interface MapActionsStructure {
    [Actions.setIsPlaying](payload: IsPlayingPayload): void;
    [Actions.setAudioContext](payload: AudioContextPayload): void;
    [Actions.setAudioBuffer](payload: AudioBufferPayload): void;
    [Actions.setAudioSource](payload: AudioSourcePayload): void;
    [Actions.setAudioFile](payload: AudioFilePayload): void;
    [Actions.setAudioFileMetadata](payload: AudioFileMetadataPayload): void;
    [Actions.setAudioLoaded](payload: AudioLoadedPayload): void;
    [Actions.setCurrentTime](payload: CurrentTimePayload): void;
    [Actions.setStartedAt](payload: StartedAtPayload): void;
    [Actions.setPausedAt](payload: PausedAtPayload): void;
    [Actions.setTotalCompensation](payload: TotalCompensationPayload): void;
}

// -------------------
// --- Audio Store ---
// -------------------

const namespaced = false;

const state: AudioState = {
    isPlaying: false,
    audioContext: new AudioContext(),
    audioBuffer: null,
    audioSource: null,
    audioFile: null,
    audioFileMetadata: null,
    audioLoaded: false,
    currentTime: 0,
    startedAt: 0,
    pausedAt: 0,
    totalCompensation: 0
};

const getters: GetterTree<AudioState, RootState> = {
    [Getters.isPlaying](state): boolean {
        return state.isPlaying;
    },
    [Getters.audioContext](state): AudioContext {
        return state.audioContext;
    },
    [Getters.audioBuffer](state): AudioBuffer | null {
        return state.audioBuffer;
    },
    [Getters.audioSource](state): AudioBufferSourceNode | null {
        return state.audioSource;
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
    [Getters.currentTime](state): number {
        return state.currentTime;
    },
    [Getters.startedAt](state): number {
        return state.startedAt;
    },
    [Getters.pausedAt](state): number {
        return state.pausedAt;
    },
    [Getters.totalCompensation](state): number {
        return state.totalCompensation;
    }
};

const mutations: MutationTree<AudioState> = {
    [Mutations.setIsPlaying](state, { playing }: IsPlayingPayload) {
        Vue.set(state, "isPlaying", playing);
    },
    [Mutations.setAudioContext](state, { audioContext }: AudioContextPayload){
        Vue.set(state, "audioContext", audioContext);
    },
    [Mutations.setAudioBuffer](state, { audioBuffer }: AudioBufferPayload) {
        Vue.set(state, "audioBuffer", audioBuffer);
    },
    [Mutations.setAudioSource](state, { audioSource }: AudioSourcePayload) {
        Vue.set(state, "audioSource", audioSource);
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
    [Mutations.setCurrentTime](state, { currentTime }: CurrentTimePayload) {
        Vue.set(state, "currentTime", currentTime);
    },
    [Mutations.setStartedAt](state, { startedAt }: StartedAtPayload) {
        Vue.set(state, "startedAt", startedAt);
    },
    [Mutations.setPausedAt](state, { pausedAt }: PausedAtPayload) {
        Vue.set(state, "pausedAt", pausedAt);
    },
    [Mutations.setTotalCompensation](state, { totalCompensation }: TotalCompensationPayload) {
        Vue.set(state, "totalCompensation", totalCompensation);
    }
};

const actions: ActionTree<AudioState, RootState> = {
    [Actions.setIsPlaying]({ commit }, payload: IsPlayingPayload) {
        commit(Mutations.setIsPlaying, payload);
    },
    [Actions.setAudioContext]({ commit }, payload: AudioContextPayload) {
        commit(Mutations.setAudioContext, payload);
    },
    [Actions.setAudioBuffer]({ commit }, payload: AudioBufferPayload) {
        commit(Mutations.setAudioBuffer, payload);
    },
    [Actions.setAudioSource]({ commit }, payload: AudioSourcePayload) {
        commit(Mutations.setAudioSource, payload);
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
    [Actions.setCurrentTime]({ commit }, payload: CurrentTimePayload) {
        commit(Mutations.setCurrentTime, payload);
    },
    [Actions.setStartedAt]({ commit }, payload: StartedAtPayload) {
        commit(Mutations.setStartedAt, payload);
    },
    [Actions.setPausedAt]({ commit }, payload: PausedAtPayload) {
        commit(Mutations.setPausedAt, payload);
    },
    [Actions.setTotalCompensation]({ commit }, payload: TotalCompensationPayload) {
        commit(Mutations.setTotalCompensation, payload);
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
import { defineStore } from "pinia";
import type { AudioFileMetadata } from "@/managers/ConnectionManager";
import { computed, reactive, ref } from "vue";

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

// -------------------
// --- Audio Store ---
// -------------------

export const useAudioStore = defineStore("audio", () => {
  const namespaced = ref(false);

  const state = reactive<AudioState>({
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
    totalCompensation: 0,
  });

  const isPlaying = computed(() => state.isPlaying);
  const audioContext = computed(() => state.audioContext);
  const audioSource = computed(() => state.audioSource);
  const audioFile = computed(() => state.audioFile);
  const audioFileMetadata = computed(() => state.audioFileMetadata);
  const audioLoaded = computed(() => state.audioLoaded);
  const currentTime = computed(() => state.currentTime);
  const startedAt = computed(() => state.startedAt);
  const pausedAt = computed(() => state.pausedAt);
  const totalCompensation = computed(() => state.totalCompensation);

  const setIsPlaying = (playing: boolean) => {
    state.isPlaying = playing;
  };

  const setAudioContext = (audioContext: AudioContext) => {
    state.audioContext = audioContext;
  };

  const setAudioBuffer = (audioBuffer: AudioBuffer) => {
    state.audioBuffer = audioBuffer;
  };

  const setAudioSource = (audioSource: AudioBufferSourceNode) => {
    state.audioSource = audioSource;
  };

  const setAudioFile = (audioFile: Blob) => {
    state.audioFile = audioFile;
  };

  const setAudioFileMetadata = (audioFileMetadata: AudioFileMetadata) => {
    state.audioFileMetadata = audioFileMetadata;
  };

  const setAudioLoaded = (loaded: boolean) => {
    state.audioLoaded = loaded;
  };

  const setCurrentTime = (currentTime: number) => {
    state.currentTime = currentTime;
  };

  const setStartedAt = (startedAt: number) => {
    state.startedAt = startedAt;
  };

  const setPausedAt = (pausedAt: number) => {
    state.pausedAt = pausedAt;
  };

  const setTotalCompensation = (totalCompensation: number) => {
    state.totalCompensation = totalCompensation;
  };

  return {
    namespaced,
    state,
    isPlaying,
    audioContext,
    audioSource,
    audioFile,
    audioFileMetadata,
    audioLoaded,
    currentTime,
    startedAt,
    pausedAt,
    totalCompensation,
    setIsPlaying,
    setAudioContext,
    setAudioBuffer,
    setAudioSource,
    setAudioFile,
    setAudioFileMetadata,
    setAudioLoaded,
    setCurrentTime,
    setStartedAt,
    setPausedAt,
    setTotalCompensation,
  };
});

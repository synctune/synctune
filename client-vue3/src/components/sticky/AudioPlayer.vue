<template>
  <div id="AudioPlayer"></div>
</template>

<script setup lang="ts">
import type ConnectionManager from "@/managers/ConnectionManager";
import { useAudioStore } from "@/stores/audio";
import { useRoomStore } from "@/stores/room";
import CancellationToken from "@/utilities/CancellationToken";
import HighResolutionTimeout from "@/utilities/HighResolutionTimeout";
import { onMounted, reactive, watch } from "vue";

interface CachedPlaySignal {
  startLocation: number;
  startTime: number;
  receivedTime: number;
}

interface State {
  currTimeUpdatorId: number | null;
  audioLoadCancellationToken: CancellationToken | null;
  cachedPlaySignal: CachedPlaySignal | null;
}

const state = reactive<State>({
  currTimeUpdatorId: null,
  audioLoadCancellationToken: null,
  cachedPlaySignal: null,
});

const roomStore = useRoomStore();
const audioStore = useAudioStore();

const playAudio = async (
  startLocation: number,
  startTime: number,
  instant: boolean
) => {
  // The audio for the local client hasn't loaded yet, the connection has not
  // time synced yet, or no clients are connected to the room, cache a play
  // signal
  if (
    !audioStore.audioLoaded ||
    !(
      roomStore.connectionManager.timesynced ||
      !roomStore.connectionManager.hasClients
    )
  ) {
    // Cache new play signal
    const newCachedPlaySignal: CachedPlaySignal = {
      startLocation,
      startTime,
      receivedTime: roomStore.connectionManager.now(),
    };

    state.cachedPlaySignal = newCachedPlaySignal;
    return;
  }

  // Clear cached play signal
  state.cachedPlaySignal = null;

  const prevAudioSource = audioStore.audioSource;

  const newAudioSource = audioStore.audioContext.createBufferSource();
  newAudioSource.buffer = audioStore.audioBuffer;
  newAudioSource.connect(audioStore.audioContext.destination);

  // Note: do NOT use addEventListener here, it is intentional that we
  // want only one event handler here so it is able to be removed later on
  newAudioSource.onended = () => {
    // If the song ended on its own accord
    if (audioStore.isPlaying) {
      stopAudio();
    }
  };

  audioStore.setAudioSource(newAudioSource);

  let offset = startLocation;

  // Overshoot is the amount of milliseconds we overshot the target delay by
  const startAudio = (overshoot = 0) => {
    // Stop any audio that may be already playing
    if (prevAudioSource) {
      prevAudioSource.onended = () => {};
      prevAudioSource.disconnect();
      prevAudioSource.stop();
    }

    // Start the audio from the given offset, accounting for any overshoot and manual compensation
    const startTime = Math.max(
      offset + overshoot / 1000 + audioStore.totalCompensation,
      0
    );
    newAudioSource.start(0, startTime);

    audioStore.setStartedAt(audioStore.audioContext.currentTime - offset);
    audioStore.setPausedAt(0);

    audioStore.setIsPlaying(true);

    startCurrTimeUpdator();
  };

  if (instant) {
    startAudio();
  } else {
    const startDelay = startTime - roomStore.connectionManager.now();
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
};

const pauseAudio = async () => {
  const elapsedTime =
    audioStore.audioContext.currentTime - audioStore.startedAt;
  audioStore.setPausedAt(elapsedTime);
  stopAudio();
};

const stopAudio = () => {
  audioStore.setIsPlaying(false);
  stopCurrTimeUpdator();

  // Clear the cached play signal, if there is one
  state.cachedPlaySignal = null;

  if (audioStore.audioSource) {
    audioStore.audioSource.onended = () => {};
    audioStore.audioSource.disconnect();
    // To handle if we never started the audio
    // e.g. disconnecting from room without ever playing audio
    try {
      audioStore.audioSource.stop(0);
    } catch (err) {
      // Empty
    }

    audioStore.setAudioSource(null);
  }
};

const doPreloadFakeout = () => {
  // Do not run if we are already playing audio
  if (audioStore.isPlaying) return;

  const audioSource = audioStore.audioContext.createBufferSource();
  audioSource.buffer = audioStore.audioBuffer;
  audioSource.connect(audioStore.audioContext.destination);
  audioSource.start();
  audioSource.stop();
  audioSource.disconnect();
};

const startCurrTimeUpdator = () => {
  // Stop the existing time updator interval, if one is running
  if (state.currTimeUpdatorId) {
    clearInterval(state.currTimeUpdatorId);
  }

  function updateCurrTime() {
    const currTime = audioStore.audioContext.currentTime - audioStore.startedAt;

    // Don't update if we've hit the end of the song
    if (!audioStore.audioBuffer || currTime > audioStore.audioBuffer.duration) {
      return;
    }

    audioStore.setCurrentTime(currTime);
  }

  // Update the current time tracker every second
  updateCurrTime();
  state.currTimeUpdatorId = setInterval(updateCurrTime, 1000);
};

const stopCurrTimeUpdator = () => {
  // Stop the existing time updator interval, if one is running
  if (state.currTimeUpdatorId) {
    clearInterval(state.currTimeUpdatorId);
    audioStore.setCurrentTime(audioStore.pausedAt);
    state.currTimeUpdatorId = null;
  }
};

const runCachedPlaySignal = () => {
  if (state.cachedPlaySignal) {
    playAudio(
      state.cachedPlaySignal.startLocation,
      state.cachedPlaySignal.startTime,
      false
    );
  }
};

const loadAudioFile = (audioFile: Blob) => {
  const connectionManager = roomStore.connectionManager;

  audioStore.setAudioFile(audioFile);

  audioStore.setAudioLoaded(false);
  audioStore.setIsPlaying(false);
  audioStore.setStartedAt(0);
  audioStore.setPausedAt(0);

  // If there is another audio file already loading, then attempt to cancel it
  if (state.audioLoadCancellationToken) {
    state.audioLoadCancellationToken.requestCancellation();
  }

  // Setup our own cancellation token and override the old one
  const cancellationToken = new CancellationToken();
  state.audioLoadCancellationToken = cancellationToken;

  const fileReader = new FileReader();
  fileReader.readAsArrayBuffer(audioFile);

  fileReader.addEventListener("load", (event) => {
    const arrBuffer = event.target?.result as ArrayBuffer;

    try {
      audioStore.audioContext.decodeAudioData(arrBuffer, (audioBuffer) => {
        // If a cancellation was requested, then oblige and don't load the audio
        if (cancellationToken.requestedCancellation) {
          cancellationToken.completedCancellation();
          return;
        }

        audioStore.setAudioBuffer(audioBuffer);
        audioStore.setAudioLoaded(true);

        // This is meant to stop a bug where a massive amount of delay occurs when
        // playing an audio clip for the first time
        doPreloadFakeout();

        // Send ready to play signal
        const connectionManager = roomStore.connectionManager;
        if (!connectionManager.isOwner) {
          connectionManager.sendReadyToPlaySignal(connectionManager.id!);

          if (roomStore.timesynced) {
            // Run the cached play signal, if it exists
            runCachedPlaySignal();
          }
        }
      });
    } catch (err) {
      if (roomStore.isOwner) return;

      connectionManager.sendAudioFileLoadFailedSignal(connectionManager.id);
    }
  });
};

const unloadAudioFile = () => {
  if (audioStore.audioSource) {
    audioStore.audioSource.disconnect();
    audioStore.setAudioSource(null);
  }

  audioStore.setAudioFile(null);
  audioStore.setAudioFileMetadata(null);
  audioStore.setAudioLoaded(false);
  audioStore.setIsPlaying(false);
  audioStore.setStartedAt(0);
  audioStore.setPausedAt(0);
};

const setupConnectionManagerListeners = (
  connectionManager: ConnectionManager
) => {
  connectionManager.addEventListener("audiometadatasent", (metadata) => {
    audioStore.setAudioFileMetadata(metadata);
  });

  connectionManager.addEventListener("audiometadatareceived", (metadata) => {
    audioStore.setAudioFileMetadata(metadata);
  });

  connectionManager.addEventListener(
    "audiofilesyncing",
    ({ audioFile, syncSelf }) => {
      if (!syncSelf) return;

      // Unload existing audiofile, if one is loaded
      unloadAudioFile();

      loadAudioFile(audioFile);
    }
  );

  connectionManager.addEventListener("audiofilereceived", (audioFile) => {
    loadAudioFile(audioFile);
  });

  connectionManager.addEventListener("playsignalreceived", (data) => {
    playAudio(data.startLocation, data.startTime, data.instant);
  });

  connectionManager.addEventListener("pausesignalreceived", () => {
    pauseAudio();
  });

  connectionManager.addEventListener("stopsignalreceived", () => {
    stopAudio();
  });

  connectionManager.addEventListener("room-left", () => {
    stopAudio();
    unloadAudioFile();
  });

  connectionManager.addEventListener("timesyncchanged", (timesynced) => {
    if (timesynced == true && audioStore.audioLoaded) {
      // Run the cached play signal, if it exists
      runCachedPlaySignal();
    }
  });
};

onMounted(() => {
  // TODO: why is this giving a type error and why is it expanding the type?
  setupConnectionManagerListeners(
    roomStore.connectionManager as ConnectionManager
  );
});

watch(
  () => roomStore.isConnected,
  (connected) => {
    // Connection closed, clear audio file
    if (!connected) unloadAudioFile();
  }
);
</script>

<style lang="scss">
#AudioPlayer {
  position: absolute;
}
</style>

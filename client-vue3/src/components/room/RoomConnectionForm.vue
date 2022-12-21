<template>
  <ContentContainer
    class="RoomConnection__super-container"
    base-class="RoomConnectionForm"
    accent-class="RoomConnectionForm__accent"
    :vertical-accents="false"
  >
    <div class="RoomConnection__get-started">Get Started</div>

    <div class="RoomConnectionForm__nickname-title">Nickname</div>

    <InputField
      class="RoomConnectRoom__nickname-input"
      placeholder="Enter Nickname"
      v-model:value="state.nickname"
      :disabled="roomStore.isConnected"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />

    <ButtonInputHybrid
      class="RoomConnectionForm__join"
      @button-click="joinRoom"
      :button-disabled="
        !validRoomName || roomStore.isConnected || !validNickname
      "
      :input-disabled="roomStore.isConnected"
      input-placeholder="Enter Room Code"
      :value="state.roomName"
      @input="updateRoomName"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    >
      <template v-slot:hybrid-button> Join Room </template>
    </ButtonInputHybrid>

    <div class="RoomConnectionForm__or-text">or</div>

    <ButtonSecondary
      class="RoomConnectionForm__create"
      @click="createRoom"
      :disabled="roomStore.isConnected || !validNickname"
    >
      Create Room
    </ButtonSecondary>
  </ContentContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from "vue";
import { NICKNAME_STORAGE_KEY } from "@/constants";
import * as Utilities from "@/utilities";

import ContentContainer from "@/components/ui/ContentContainer.vue";
import InputField from "@/components/ui/forms/InputField.vue";
import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import ButtonInputHybrid from "@/components/ui/button/ButtonInputHybrid.vue";
import { useRoomStore } from "@/stores/room";
import { useRouter } from "vue-router";

interface State {
  nickname: string;
  roomName: string;
}

const state = reactive<State>({
  nickname: "",
  roomName: "",
});

const router = useRouter();
const roomStore = useRoomStore();

const validRoomName = computed(() => {
  const isEmpty = !roomStore.roomName.trim();
  return !isEmpty;
});

const validNickname = computed(() => {
  const isEmpty = !state.nickname.trim();
  return !isEmpty;
});

const joinRoom = () => {
  router.push({ path: `/room/join/${state.roomName}` }).catch(() => {});
};

const createRoom = () => {
  // Generate a name for the room
  const id = Utilities.generateRoomCode();

  router.push({ path: `/room/create/${id}` }).catch(() => {});
};

const updateRoomName = (newRoomName: string) => {
  state.roomName = newRoomName.trim().toUpperCase();
};

watch(
  () => state.nickname,
  (newNickname) => {
    // Store updated nickname in local storage
    localStorage.setItem(NICKNAME_STORAGE_KEY, newNickname);
    roomStore.connectionManager.setNickname(newNickname);
  }
);

onMounted(() => {
  // Attempt to load stored nickname
  const nickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
  if (nickname) {
    state.nickname = nickname;
  }
});
</script>

<style lang="scss">
.RoomConnection__super-container {
  max-width: 50rem;
  width: 100%;
}

// Note this is a trick to increase specificity
.RoomConnectionForm.RoomConnectionForm {
  $padding-top: 5rem;
  $padding-sides: 1rem;

  background-color: color-link("RoomConnectionForm", "background", "secondary");

  display: flex;
  flex-direction: column;
  align-items: center;

  padding: $padding-top $padding-sides;

  & .RoomConnection__get-started {
    font-size: 3.5rem;
    font-weight: bold;

    text-align: center;

    margin-bottom: 2.5rem;
  }

  & .RoomConnectionForm__nickname-title {
    color: color-link("RoomConnectionForm", "text", "tertiary");
    margin-left: 0.3rem;
  }

  & .RoomConnectRoom__nickname-input {
    margin-bottom: 3.2rem;
  }

  & .RoomConnectRoom__nickname-input,
  & .RoomConnectionForm__nickname-title {
    max-width: 30rem;
    width: 100%;
  }

  $or-spacing: 0.6rem;

  & .RoomConnectionForm__join {
    margin-bottom: $or-spacing;
  }

  & .RoomConnectionForm__or-text {
    color: color-link("RoomConnectionForm", "text", "tertiary");
    font-size: 1.7rem;
    margin-bottom: $or-spacing;
  }

  @include respond(phone) {
    $padding-top: 3rem;
    $padding-sides: 1rem;
    padding: $padding-top $padding-sides;
  }
}
</style>

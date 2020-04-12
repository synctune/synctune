<template>
    <container 
        class="RoomConnection__super-container"
        base-class="RoomConnectionForm"
        accent-class="RoomConnectionForm__accent"
        :vertical-accents="false"
    >
        <div class="RoomConnection__get-started">
            Get Started
        </div>

        <div class="RoomConnectionForm__nickname-title">
            Nickname
        </div>

        <input-field 
            class="RoomConnectRoom__nickname-input"
            placeholder="Enter Nickname"
            v-model="nickname"
            :disabled="isConnected"

            autocomplete="off" 
            autocorrect="off" 
            autocapitalize="off" 
            spellcheck="false"
        />

        <button-input-hybrid
            class="RoomConnectionForm__join"
            @button-click="joinRoom"
            :button-disabled="!validRoomName || isConnected || !validNickname"
            :input-disabled="isConnected"
            input-placeholder="Enter Room Code"

            :value="roomName"
            @input="updateRoomName"

            autocomplete="off" 
            autocorrect="off" 
            autocapitalize="off" 
            spellcheck="false"
        >
            Join Room
        </button-input-hybrid>

        <div class="RoomConnectionForm__or-text">
            or
        </div>

        <button-secondary
            class="RoomConnectionForm__create"
            @click="createRoom"
            :disabled="isConnected || !validNickname"
        >
            Create Room
        </button-secondary>
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import VueRouter from 'vue-router';
import { mapGetters } from "vuex";
import { NICKNAME_STORAGE_KEY } from "../../constants";
import * as RoomStore from "../../store/modules/room";
import * as Utilities from "../../utilities";
import ConnectionManager from '../../managers/ConnectionManager';

import Container from "@/components/ui/Container.vue";
import InputField from "@/components/ui/forms/InputField.vue";
import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";
import ButtonInputHybrid from "@/components/ui/button/ButtonInputHybrid.vue";


interface Data {
    nickname: string;
    roomName: string;
}

type Computed = {
    validRoomName(): boolean;
    validNickname(): boolean;
} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
    | RoomStore.Getters.connectionManager
>

interface Methods {
    joinRoom(): void;
    createRoom(): void;
    updateRoomName(value: string): void;
}

export default Vue.extend({
    components: {
        Container,
        InputField,
        ButtonSecondary,
        ButtonInputHybrid
    },
    data() {
        return {
            nickname: "",
            roomName: ""
        }
    },
    mounted() {
        // Attempt to load stored nickname
        const nickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
        if (nickname) {
            this.nickname = nickname;
        }
    },
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected,
            connectionManager: RoomStore.Getters.connectionManager
        }),
        validRoomName() {
            const { roomName }: Data = this;
            const isEmpty = !roomName.trim();
            return !isEmpty; 
        },
        validNickname() {
            const { nickname }: Data = this;
            const isEmpty = !nickname.trim();
            return !isEmpty; 
        }
    },
    methods: {
        joinRoom() {
            const { roomName }: Data = this;
            const router = this.$router as VueRouter;

            router.push({ path: `/room/join/${roomName}` }).catch(() => {});
        },
        createRoom() {
            const router = this.$router as VueRouter;

            // Generate a name for the room
            const id = Utilities.generateRoomCode();

            router.push({ path: `/room/create/${id}` }).catch(() => {});
        },
        updateRoomName(value: string) {
            this.roomName = value.trim().toUpperCase();
        }
    },
    watch: {
        nickname(newNickname: string) {
            const connectionManager = this.connectionManager as ConnectionManager;

            // Store updated nickname in local storage
            localStorage.setItem(NICKNAME_STORAGE_KEY, newNickname);
            connectionManager.setNickname(newNickname);
        }
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

        & .RoomConnectRoom__nickname-input, & .RoomConnectionForm__nickname-title {
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
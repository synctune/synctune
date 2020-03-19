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

        <input-field 
            class="RoomConnectRoom__name"
            placeholder="Enter Room Name"
            v-model="roomName"
        />

        <button-primary
            class="RoomConnectionForm__join"
            @click="joinRoom"
            :disabled="!validRoomName || isConnected"
        >
            Join Room
        </button-primary>

        <button-secondary
            class="RoomConnectionForm__create"
            @click="createRoom"
            :disabled="!validRoomName || isConnected"
        >
            Create Room
        </button-secondary>
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import VueRouter from 'vue-router';
import { mapGetters } from "vuex";
import * as RoomStore from "../store/modules/room";

import Container from "@/components/ui/Container.vue";
import InputField from "@/components/ui/forms/InputField.vue";
import ButtonPrimary from "@/components/ui/button/ButtonPrimary.vue";
import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";

interface Data {
    roomName: string;
}

type Computed = {
    emptyRoomName(): boolean;
} & Pick<RoomStore.MapGettersStructure,
    RoomStore.Getters.isConnected
>

interface Methods {
    joinRoom(): void;
    createRoom(): void;
}

export default Vue.extend({
    components: {
        Container,
        InputField,
        ButtonPrimary,
        ButtonSecondary
    },
    data() {
        return {
            roomName: "test" // TODO: change to some other default
        }
    },
    computed: {
        ...mapGetters({
            isConnected: RoomStore.Getters.isConnected
        }),
        validRoomName() {
            const { roomName }: Data = this;
            const isEmpty = !roomName.trim();
            // TODO: add alphaneumeric check
            return !isEmpty; 
        }
    },
    methods: {
        joinRoom() {
            const { roomName }: Data = this;
            const router = this.$router as VueRouter;

            router.push({ path: `/room/join/${roomName}` });
        },
        createRoom() {
            const { roomName }: Data = this;
            const router = this.$router as VueRouter;

            router.push({ path: `/room/create/${roomName}` });
        }
    }
});
</script>

<style lang="scss" scoped>
    .RoomConnection__super-container {
        max-width: 50rem;
        width: 100%;
    }

    // Note this is a trick to increase specificity
    /deep/ .RoomConnectionForm.RoomConnectionForm {
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

        & .RoomConnectRoom__name {
            margin-bottom: 2.5rem;

            max-width: 30rem;
            width: 100%;

        }

        & .RoomConnectionForm__join {
            margin-bottom: 1.5rem;
        }

        @include respond(phone) {
            $padding-top: 3rem;
            $padding-sides: 1rem;
            padding: $padding-top $padding-sides;
        }
    }
</style>
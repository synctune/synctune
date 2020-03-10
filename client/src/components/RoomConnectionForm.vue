<template>
    <div class="RoomConnectionForm">
        <input 
            class="RoomConnectRoom__name"
            type="text"
            v-model="roomName"
        >

        <button 
            class="RoomConnectionForm__create"
            @click="createRoom"
            :disabled="!validRoomName"
        >
            Create Room
        </button>

        <button 
            class="RoomConnectionForm__join"
            @click="joinRoom"
            :disabled="!validRoomName"
        >
            Join Room
        </button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import VueRouter from 'vue-router';

interface Data {
    roomName: string;
}

interface Computed {
    emptyRoomName(): boolean;
}

interface Methods {
    joinRoom(): void;
    createRoom(): void;
}

export default Vue.extend({
    data() {
        return {
            roomName: "test" // TODO: change to some other default
        }
    },
    computed: {
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
    
</style>
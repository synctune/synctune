<template>
    <button @click="createRoom">
        Create Room
    </button>
</template>

<script lang="ts">
import Vue from 'vue';
import io from "socket.io-client";

export default Vue.extend({
    data() {
        return {
            
        }
    },
    methods: {
        createRoom() {
            const socket = io("localhost:5000");

            socket.emit("room-create", "test");
            socket.on("room-created", (message: string) => {
                console.log("Server:", message);
            });
        }
    }
});
</script>

<style>

</style>
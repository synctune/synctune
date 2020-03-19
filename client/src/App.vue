<template>
    <div id="app">
        <div id="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/room">Room</router-link>
            <!-- TODO: remove these test links -->
            <!-- <router-link to="/test-rtc-camera-local">Test RTC Camera Local</router-link> |
            <router-link to="/test-rtc-audio-file-local">Test RTC Audio File Local</router-link> |
            <router-link to="/test-rtc-signalling-server">Test RTC Signalling Server</router-link> | -->
        </div>
        <router-view />

        <!-- Sticky components -->
        <room-status />
        <audio-player />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import RoomStatus from "./components/sticky/RoomStatus.vue";
import AudioPlayer from "./components/sticky/AudioPlayer.vue";

export default Vue.extend({
    components: {
        RoomStatus,
        AudioPlayer
    }
});
</script>

<style lang="scss">
    #app {
        height: 100%;
        position: relative;
    }
</style>

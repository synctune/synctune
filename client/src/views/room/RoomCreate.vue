<template>
    <room-connection-handler 
        mode="create"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import RoomConnectionHandler from "@/components/room/RoomConnectionHandler.vue";

export default Vue.extend({
    components: {
        RoomConnectionHandler
    }
});
</script>
<template>
    <div id="RoomStatus__container">
        <div id="RoomStatus">
            This shows the current room status
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';


export default Vue.extend({
    
});
</script>

<style lang="scss" scoped>
    #RoomStatus__container {
        position: fixed;
        left: 50%;
        transform: translateX(-50%);
        bottom: 0;

        padding: 0 0.5rem 0.5rem 0.5rem;

        max-width: 20rem;
        width: 100%;
    }

    #RoomStatus {
        background-color: rgb(57, 191, 231);

        width: 100%;
        border-radius: 0.1rem;
        padding: 0.5rem;
    }
</style>
<template>
    <container 
        class="ConnectedDevicesContainer"
        :vertical-accents="false"
    >
        List of connected devices
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import Container from "@/components/ui/Container.vue";

export default Vue.extend({
    components: {
        Container
    }
});
</script>

<style lang="scss" scoped>
    .ConnectedDevicesContainer {
        width: 100%;
    }
</style>
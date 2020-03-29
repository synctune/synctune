<template>
    <container 
        class="MusicControlsContainer"
        :vertical-accents="false"
    >
        Music Controls
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
    .MusicControlsContainer {
        width: 100%;
    }
</style>
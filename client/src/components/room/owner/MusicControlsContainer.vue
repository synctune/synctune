<template>
    <container 
        class="MusicControlsContainer"
        base-class="MusicControlsContainer__container"
        :vertical-accents="false"
    >
        <artwork-thumbnail 
            class="MusicControlsContainer__artwork-thumbnail"
        />

        Music Controls
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import Container from "@/components/ui/Container.vue";
import ArtworkThumbnail from "@/components/ui/ArtworkThumbnail.vue";

export default Vue.extend({
    components: {
        Container,
        ArtworkThumbnail
    }
});
</script>

<style lang="scss" scoped>
    .MusicControlsContainer {
        width: 100%;

        & /deep/ .MusicControlsContainer__container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
    }
</style>
<template>
    <base-notification
        position="top right"
        v-bind="$attrs"
        group="notification"
        type="error"
        base-class="InfoNotification"
        accent-class="InfoNotification__accent"
        close-class="InfoNotification__close"
        title-class="InfoNotification__title"
        text-class="InfoNotification__text"
    >
    </base-notification>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseNotification from "@/components/notifications/BaseNotification.vue";

export default Vue.extend({
    components: {
        BaseNotification
    }
});
</script>

<style lang="scss">
    .InfoNotification.InfoNotification {
        background-color: color-link("InfoNotification", "info", "background");

        & .InfoNotification__text {
            color: color-link("InfoNotification", "info", "text");
        }
    }

    .InfoNotification__accent.InfoNotification__accent {
        background-color: color-link("InfoNotification", "info", "accent");
    }
</style>
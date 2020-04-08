<template>
    <base-notification
        position="top right"
        v-bind="$attrs"
        group="notification"
        type="error"
        base-class="ErrorNotification"
        accent-class="ErrorNotification__accent"
        close-class="ErrorNotification__close"
        title-class="ErrorNotification__title"
        text-class="ErrorNotification__text"
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
    .ErrorNotification.ErrorNotification {
        background-color: color-link("ErrorNotification", "error", "background");

        & .ErrorNotification__text {
            color: color-link("ErrorNotification", "error", "text");
        }
    }

    .ErrorNotification__accent.ErrorNotification__accent {
        background-color: color-link("ErrorNotification", "error", "accent");
    }
</style>
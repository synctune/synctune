<template>
    <base-notification
        position="top right"
        v-bind="$attrs"
        group="notification"
        type="error"
        base-class="WarningNotification"
        accent-class="WarningNotification__accent"
        close-class="WarningNotification__close"
        title-class="WarningNotification__title"
        text-class="WarningNotification__text"
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
    .WarningNotification.WarningNotification {
        background-color: color-link("WarningNotification", "warning", "background");

        & .WarningNotification__text {
            color: color-link("WarningNotification", "warning", "text");
        }
    }

    .WarningNotification__accent.WarningNotification__accent {
        background-color: color-link("WarningNotification", "warning", "accent");
    }
</style>
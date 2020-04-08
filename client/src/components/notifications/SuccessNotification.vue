<template>
    <base-notification
        position="top right"
        v-bind="$attrs"
        group="notification"
        type="error"
        base-class="SuccessNotification"
        accent-class="SuccessNotification__accent"
        close-class="SuccessNotification__close"
        title-class="SuccessNotification__title"
        text-class="SuccessNotification__text"
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
    .SuccessNotification.SuccessNotification {
        background-color: color-link("SuccessNotification", "success", "background");

        & .SuccessNotification__text {
            color: color-link("SuccessNotification", "success", "text");
        }
    }

    .SuccessNotification__accent.SuccessNotification__accent {
        background-color: color-link("SuccessNotification", "success", "accent");
    }
</style>
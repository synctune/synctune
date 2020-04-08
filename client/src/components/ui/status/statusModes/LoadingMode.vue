<template>
    <base-mode
        class="LoadingMode"
        v-bind="$attrs"
    >
        <circle-spinner 
            class="LoadingMode__spinner"
            v-bind="$attrs"
        />
    </base-mode>
</template>

<script lang="ts">
import Vue from 'vue';

import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";

export default Vue.extend({
    components: {
        BaseMode,
        CircleSpinner
    }
});
</script>

<style lang="scss">
    .LoadingMode {
        & .LoadingMode__spinner circle {
            stroke: color-link("LoadingMode", "sync_status", "loading");
        }
    }
</style>
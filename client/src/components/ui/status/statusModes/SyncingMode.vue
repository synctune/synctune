<template>
    <base-mode
        class="SyncingMode"
        v-bind="$attrs"
    >
        <circle-spinner 
            class="SyncingMode__spinner"
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
    .SyncingMode {
        & .SyncingMode__spinner circle {
            stroke: color-link("SyncingMode", "sync_status", "syncing");
        }
    }
</style>
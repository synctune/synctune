<template>
    <base-mode
        class="ErrorMode"
        v-bind="$attrs"
    >
        <svg-ring
            class="ErrorMode__ring"
            v-bind="$attrs"
        />
    </base-mode>
</template>

<script lang="ts">
import Vue from 'vue';

import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import SvgRing from "@/components/ui/rings/SvgRing.vue";

export default Vue.extend({
    components: {
        BaseMode,
        SvgRing
    }
});
</script>

<style lang="scss">
    .ErrorMode {
        & .ErrorMode__ring circle {
            stroke: color-link("ErrorMode", "sync_status", "error");
        }
    }
</style>
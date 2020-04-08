<template>
    <base-mode
        class="ReadyMode"
        v-bind="$attrs"
    >
        <svg-ring
            class="ReadyMode__ring"
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
    .ReadyMode {
        & .ReadyMode__ring circle {
            stroke: color-link("ReadyMode", "sync_status", "ready");
        }
    }
</style>
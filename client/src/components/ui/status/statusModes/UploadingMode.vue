<template>
    <base-mode
        class="UploadingMode"
        v-bind="$attrs"
    >
        <circle-loader 
            v-if="hasProgress"
            class="UploadingMode__loader"
            :progress="progress"
            v-bind="$attrs"
        />
        <circle-spinner 
            v-else
            class="UploadingMode__loader"
            v-bind="$attrs"
        />
    </base-mode>
</template>

<script lang="ts">
import Vue from 'vue';

import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import CircleLoader from "@/components/ui/loaders/CircleLoader.vue";
import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";

interface Props {
    progress: number | null;
}

interface Computed {
    hasProgress: boolean;
}

export default Vue.extend({
    components: {
        BaseMode,
        CircleLoader,
        CircleSpinner
    },
    props: {
        progress: {
            type: Number,
            default: null
        }
    },
    computed: {
        hasProgress() {
            const { progress }: Props = this;
            return progress != null;
        }
    }
});
</script>

<style lang="scss">
    .UploadingMode {
        & .UploadingMode__loader circle {
            stroke: color-link("UploadingMode", "sync_status", "uploading");
        }
    }
</style>
<template>
    <div 
        class="StatusIndicator"
        :style="baseStyles"
    >
        <transition name="fade" mode="out-in">
            <component
                :is="getStatusComponentName(syncStatus)"
                class="StatusIndicator__mode"
                :icon-name="getIconName(syncStatus)"
                :icon-size="iconSize"
                :progress="uploadProgress"
                :radius="sizePx / 2"
                :stroke="2"
            />
        </transition>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { SyncStatus } from "../../room/owner/ConnectedDevicesContainer.vue";
import * as Utilities from "../../../utilities";

import ErrorMode from "@/components/ui/status/statusModes/ErrorMode.vue";
import ReadyMode from "@/components/ui/status/statusModes/ReadyMode.vue";
import SyncingMode from "@/components/ui/status/statusModes/SyncingMode.vue";
import UploadingMode from "@/components/ui/status/statusModes/UploadingMode.vue";
import LoadingMode from "@/components/ui/status/statusModes/LoadingMode.vue";

const STATUS_MODE_COMPONENT_MAP = {
    ready: 'ready-mode',
    syncing: 'syncing-mode',
    uploading: 'uploading-mode',
    loading: 'loading-mode',
    error: 'error-mode'
}

const ICON_STATUS_MAP = {
    ready: 'check-icon',
    syncing: 'sync-icon',
    uploading: 'download-icon',
    loading: 'download-icon',
    error: 'close-icon'
};

interface Props {
    syncStatus: SyncStatus;
    uploadProgress: number | null;
    size: string;
}

interface Computed {
    isReady: boolean;
    isSyncing: boolean;
    isUploading: boolean;
    isLoading: boolean;
    isError: boolean;
}

interface Methods {
    getIconName(status: SyncStatus): string;
    getStatusComponentName(status: SyncStatus): string;
}

export default Vue.extend({
    components: {
        ErrorMode,
        ReadyMode,
        SyncingMode,
        UploadingMode,
        LoadingMode
    },
    props: {
        syncStatus: {
            type: String,
            validator(val: string) {
                return ['ready', 'syncing', 'uploading', 'loading', 'error'].includes(val);
            }
        },
        uploadProgress: {
            type: Number,
            default: null
        },
        size: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "3rem"
        },
        iconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "1.8rem"
        },
    },
    computed: {
        baseStyles() {
            const { size }: Props = this;

            return {
                width: size,
                height: size
            }
        },
        sizePx() {
            const { size }: Props = this;
            return Utilities.remToPixel(size);
        },
        // -- Status flags --
        isReady() {
            const { syncStatus }: Props = this;
            return syncStatus === "ready";
        },
        isSyncing() {
            const { syncStatus }: Props = this;
            return syncStatus === "syncing";
        },
        isUploading() {
            const { syncStatus }: Props = this;
            return syncStatus === "uploading";
        },
        isLoading() {
            const { syncStatus }: Props = this;
            return syncStatus === "loading";
        },
        isError() {
            const { syncStatus }: Props = this;
            return syncStatus === "error";
        },
    },
    methods: {
        getIconName(status: SyncStatus) {
            return ICON_STATUS_MAP[status];
        },
        getStatusComponentName(status: SyncStatus) {
            return STATUS_MODE_COMPONENT_MAP[status];
        }
    }
});
</script>

<style lang="scss">
    .StatusIndicator {
        flex-grow: 0;
        flex-shrink: 0;

        & .StatusIndicator__mode {
            width: 100%;
            height: 100%;
        }
    }

    // Transition effects
    @include transition-effect(fade, 0.2s);
</style>
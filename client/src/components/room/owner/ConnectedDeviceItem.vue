<template>
    <div 
        :class="[
            'ConnectedDeviceItem',
            (alternateColor) ? 'alternate-color' : null
        ]"
    >
        <status-indicator 
            class="ConnectedDeviceItem__status" 
            :sync-status="data.status"
            :upload-progress="data.uploadProgress"
        />

        <div class="ConnectedDeviceItem__nickname">
            {{ data.nickname }}
        </div>

        <mini-icon-button 
            class="ConnectedDeviceItem__kick-button"
            icon-name="close-icon"
            @click="$emit('kick', data.id)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Client } from "./ConnectedDevicesContainer.vue";

import MiniIconButton from "@/components/ui/button/MiniIconButton.vue";
import StatusIndicator from "@/components/ui/status/StatusIndicator.vue";

interface Props {
    alternateColor: boolean;
    data: Client;
}

export default Vue.extend({
    components: {
        MiniIconButton,
        StatusIndicator
    },
    props: {
        alternateColor: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object,
            validator(val: any) {
                const valClient = val as Client;
                return !!valClient.nickname && !!valClient.id && !!valClient.status;
            }
        }
    }
});
</script>

<style lang="scss">
    .ConnectedDeviceItem {
        display: flex;
        justify-content: space-between;
        align-items: center;

        color: color-link("ConnectedDeviceItem", "text", "primary");
        background-color: color-link("ConnectedDeviceItem", "background", "primary");

        padding: 1rem 1.3rem;

        & .ConnectedDeviceItem__nickname {
            width: 100%;

            flex-grow: 1;
            flex-shrink: 1;

            color: color-link("ConnectedDeviceItem", "text", "secondary");

            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            font-size: 1.7rem;

            margin: 0 1rem;
        }

        &.alternate-color {
            background-color: color-link("ConnectedDeviceItem", "background", "secondary");
        }
    }
</style>
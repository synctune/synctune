<template>
    <div 
        :class="[
            'ConnectedDeviceItem',
            (alternateColor) ? 'alternate-color' : null
        ]"
    >
        <div class="ConnectedDeviceItem__status">
            O
        </div>

        <div class="ConnectedDeviceItem__nickname">
            {{ data.nickname }}
        </div>

        <div class="ConnectedDeviceItem__kick-button">
            X
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Client } from "./ConnectedDevicesContainer.vue";

interface Props {
    alternateColor: boolean;
    data: Client;
}

export default Vue.extend({
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

<style lang="scss" scoped>
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

            margin: 0 0.7rem;
        }

        &.alternate-color {
            background-color: color-link("ConnectedDeviceItem", "background", "secondary");
        }
    }
</style>
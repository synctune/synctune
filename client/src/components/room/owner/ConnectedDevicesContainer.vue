<template>
    <container 
        :class="[
            'ConnectedDevicesContainer',
            (hasClients) ? 'has-clients' : null
        ]"
        base-class="ConnectedDevicesContainer__container"
        :vertical-accents="false"
    >
        <overlay-scrollbar 
            v-if="hasClients"
            class="ConnectedDevicesContainer__device-list"
            :options="{
                paddingAbsolute: true,
                scrollbars: {
                    autoHide: 'leave'
                }
            }"
        >
            <connected-device-item 
                v-for="(client, n) in clients"
                :key="client.id"
                :data="client"
                :alternate-color="!!(n % 2)"
                @kick="$emit('kick', client.id)"
            />
        </overlay-scrollbar>
        <div 
            v-else
            class="ConnectedDevicesContainer__no-devices"
        >
            No connected devices
        </div>
    </container>
</template>

<script lang="ts">
import Vue from 'vue';
import Container from "@/components/ui/Container.vue";
import ConnectedDeviceItem from "@/components/room/owner/ConnectedDeviceItem.vue";

export type SyncStatus = "ready" | "syncing" | "uploading" | "loading" | "error";

export interface Client {
    nickname: string;
    id: string;
    status: SyncStatus;
    uploadProgress: number | null; // Number between 0 and 1
}

interface Props {
    clients: Client[];
}

export default Vue.extend({
    components: {
        Container,
        ConnectedDeviceItem
    },
    props: {
        clients: {
            type: Array,
            default: () => [],
            validator(vals: any[]) {
                return vals.every((val: any) => {
                    const valClient = val as Client;
                    return !!valClient.nickname && !!valClient.id && !!valClient.status;
                });
            }
        }
    },
    computed: {
        hasClients() {
            const { clients }: Props = this;
            return clients.length > 0;
        }
    },
});
</script>

<style lang="scss">
    .ConnectedDevicesContainer {
        width: 100%;

        display: flex;
        flex-direction: column;

        & .ConnectedDevicesContainer__container {
            flex-grow: 0;
            flex-shrink: 1;
            min-height: 0;

            display: flex;
            flex-direction: column;

            padding: 0.7rem 0;

            & .ConnectedDevicesContainer__device-list {
                height: 100%;

                display: flex;
                flex-direction: column;
            }

            & .ConnectedDevicesContainer__no-devices {
                text-align: center;
                color: color-link("ConnectedDevicesContainer", "text", "secondary");

                margin: 1rem 0;
            }
        }

        &:not(.has-clients) /deep/.ConnectedDevicesContainer__container {
            justify-content: center;
        }
    }
</style>
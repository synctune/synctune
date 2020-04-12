<template>
    <div class="NFCTest">
        <button
            @click="scanNfc"
        >
            Scan NFC
        </button>

        <button
            @click="writeNfc"
        >
            Write NFC
        </button>
    </div>
</template>

<script lang="ts">
/// <reference path="../../NFC-shims.d.ts" />
import Vue from 'vue';
import * as NotificationManager from "../../managers/NotificationManager";

export default Vue.extend({
    methods: {
        async scanNfc() {
            NotificationManager.showInfoNotification(this, "Scanning nfc");

            try {
                const reader = new NDEFReader() as any;
                await reader.scan();

                NotificationManager.showInfoNotification(this, "Scan started");

                reader.addEventListener("error", (error: any) => {
                    NotificationManager.showErrorNotification(this, "Error: " + error.messsage);
                });

                reader.addEventListener("reading", ({ message, serialNumber }: any) => {
                    NotificationManager.showSuccessNotification(this, `> Serial Number: ${serialNumber}`);
                    NotificationManager.showSuccessNotification(this, `> Records: (${message.records.length})`);
                });
            } catch(err) {
                NotificationManager.showErrorNotification(this, "Error: " + err);
            }
        },
        async writeNfc() {
            NotificationManager.showInfoNotification(this, "Writing nfc");

            try {
                const writer = new NDEFWriter() as any;
                await writer.push("Hello World!");
                NotificationManager.showSuccessNotification(this, "Message written");
            } catch(err) {
                NotificationManager.showErrorNotification(this, "Error: " + err);
            }
        }
    }
});
</script>

<style lang="scss">
    .NFCTest {
        z-index: 10;
    }
</style>
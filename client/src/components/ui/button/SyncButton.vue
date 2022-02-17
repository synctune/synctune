<template>
    <circular-button
        :class="[
            'SyncButton',
            (syncing) ? 'syncing' : null
        ]"
        :size="size"
        :disabled="syncing || disabled"
        v-bind="$attrs"
        @click="$emit('click', $event)"
    >
        <!-- Sync icon -->
        <icon-base 
            ref="syncIconRef"
            class="SyncButton__icon"
            icon-name="sync-icon"
        />

        <transition name="fade" mode="out-in">
            <div 
                v-if="syncing && !disabled"
                class="SyncButton__loader-container"
            >
                <!-- Sync loader/spinner -->
                <circle-loader
                    v-if="hasProgress"
                    class="SyncButton__loader"
                    :progress="syncProgress"
                    :radius="sizePx / 2"
                    :stroke="2"
                />
                <circle-spinner 
                    v-else
                    class="SyncButton__loader"
                    :radius="sizePx / 2"
                    :stroke="2"
                />
            </div>
        </transition>
    </circular-button>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../../utilities";
import { TweenLite } from "gsap";

import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";
import CircleLoader from "@/components/ui/loaders/CircleLoader.vue";
import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";

interface Props {
    size: string;
    iconSize: string;
    syncing: boolean;
    syncProgress: number | null;
    disabled: boolean;
}

interface Computed {
    hasProgress: boolean;
    sizePx: number;
}

interface Methods {
    startSyncingSpinAnim(): void;
    stopSyncingSpinAnim(): void;
}

export default Vue.extend({
    components: {
        CircularButton,
        IconBase,
        CircleLoader,
        CircleSpinner
    },
    props: {
        size: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "5rem"
        },
        iconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "3rem"
        },
        syncing: {
            type: Boolean,
            default: false
        },
        syncProgress: {
            type: Number,
            default: null
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        hasProgress() {
            const { syncProgress }: Props = this;
            return syncProgress != null;
        },
        sizePx() {
            const { size }: Props = this;
            return Utilities.remToPixel(size);
        },
    },
    methods: {
        startSyncingSpinAnim() {
            const syncIconEl = this.$refs.syncIconRef.$el as HTMLElement;

            function runRotation() {
                const START_STATE = { 
                    rotation: 0 
                };

                const END_STATE = {
                    rotation: -360,
                    ease: "power1.inOut",
                    onComplete: runRotation
                };

                TweenLite.fromTo(syncIconEl, 1, START_STATE, END_STATE);
            }

            runRotation();
        },
        stopSyncingSpinAnim() { 
            const syncIconEl = this.$refs.syncIconRef.$el as HTMLElement;

            TweenLite.killTweensOf(syncIconEl);

            TweenLite.to(syncIconEl, 0.5, {
                rotation: 0,
                ease: "power1.out"
            });
        }
    },
    watch: {
        syncing(newSyncing: boolean) {
            const { disabled }: Props = this;
            const { startSyncingSpinAnim, stopSyncingSpinAnim }: Methods = this;

            if (newSyncing == true && disabled == false) {
                startSyncingSpinAnim();
            } else if (newSyncing == false) {
                stopSyncingSpinAnim();
            }
        },
        disabled(newDisabled: boolean) {
            const { stopSyncingSpinAnim }: Methods = this;

            if (newDisabled == true) {
                stopSyncingSpinAnim();
            }
        }
    },
    mounted() {
        const { syncing, disabled }: Props = this;
        const { startSyncingSpinAnim }: Methods = this;

        if (syncing == true && disabled == false) {
            startSyncingSpinAnim();
        }
    },
});
</script>

<style lang="scss">
    $spin-reset-time: 1s;
    $spin-duration: 1s;

    .SyncButton {
        position: relative;

        display: flex;
        justify-content: center;
        align-items: center;

        & .SyncButton__icon {

        }

        & .SyncButton__loader-container {
            position: absolute;
            top: 0;
            left: 0;

            & .SyncButton__loader circle {
                stroke: color-link("SyncButton", "sync_status", "syncing");
            }
        }

        &.syncing {
            & .SyncButton__icon {
                
            }   
        }
    }

    // Transition effects
    @include transition-effect(fade, 0.3s);
</style>
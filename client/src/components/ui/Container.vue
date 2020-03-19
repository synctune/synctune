<template>
    <div 
        :class="[
            'Container', 
            verticalAccents ? 'vertical-accents' : 'horizontal-accents'
        ]"
    >
        <div 
            :class="['Container__container', baseClass]"
            :style="baseStyle"
            :id="baseId"
        >
            <div 
                :class="['Container__accent', accentClass]"
                :style="accentStyle"
                :id="accentId"
            ></div>
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        verticalAccents: {
            type: Boolean,
            default: true
        },
        baseClass: {
            type: String,
            default: null
        },
        baseStyle: {
            type: Object,
            default: null
        },
        baseId: {
            type: String,
            default: null
        },
        accentClass: {
            type: String,
            default: null
        },
        accentStyle: {
            type: Object,
            default: null
        },
        accentId: {
            type: String,
            default: null
        }
    }
});
</script>

<style lang="scss" scoped>
    $radius-amount: 0.7rem;

    .Container {
        $accent-size: 0.7rem;
        $radius-amount: 0.7rem;
        $padding-amount: 0.5rem;
        $padding-amount-sides: 0.5rem;

        position: relative;

        z-index: 1;

        & .Container__container {
            background-color: color-link("Container", "background", "primary");
            border-radius: $radius-amount;
            padding: $padding-amount $padding-amount-sides $padding-amount $padding-amount-sides;
        }

        & .Container__accent {
            background-color: color-link("Container", "accent", "primary");
            border-radius: $radius-amount;
            box-shadow: 0px 4px 10px -2px rgba(0,0,0,0.25);

            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            z-index: -1;
        }

        &.vertical-accents {
            & .Container__container {
                margin: 0 $accent-size 0 $accent-size;
            }
        }

        &.horizontal-accents {
            & .Container__container {
                margin: $accent-size 0 $accent-size 0;
            }
        }
    }
</style>
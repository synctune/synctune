<template>
    <div 
        :class="[
            'Container__accent', 
            accentClass, 
            verticalAccents ? 'vertical-accents' : 'horizontal-accents']"
        :style="[accentStyle]"
        :id="[accentId]"
    >
        <div 
            :class="['Container', baseClass]"
            :style="[baseStyle]"
            :id="[baseId]"
        >
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
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
        verticalAccents: {
            type: Boolean,
            default: true
        }
    }
});
</script>

<style lang="scss" scoped>
    $radius-amount: 0.7rem;

    .Container__accent {
        $accent-size: 0.7rem;

        background-color: color-link("Container", "accent", "primary");

        border-radius: $radius-amount;

        box-shadow: 0px 4px 10px -2px rgba(0,0,0,0.25);

        &.vertical-accents {
            padding: $accent-size 0 $accent-size 0;
        }

        &.horizontal-accents {
            padding: 0 $accent-size 0 $accent-size;
        }
    }

    .Container {
        $padding-amount: 0.5rem;
        $padding-amount-sides: 0.5rem;

        background-color: color-link("Container", "background", "primary");

        border-radius: $radius-amount;

        padding: $padding-amount $padding-amount-sides $padding-amount $padding-amount-sides;
    }
</style>
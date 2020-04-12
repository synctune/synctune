<template>
    <div class='BaseNotification'>
        <div 
            :class="['BaseNotification__accent', accentClass]"
            :style="accentStyle"
            :id="accentId"
        >
        </div>

        <div 
            :class="['BaseNotification__base', baseClass]"
            :style="[baseStyle]"
            :id="[baseId]"
        >
            <icon-clickable
                icon-name="close"
                :class="['BaseNotification__close', closeClass]"
                :style="[closeStyle]"
                :id="[closeId]"
                size="1.7rem"
                @click="props.close"
            />

            <div 
                :class="['BaseNotification__title', titleClass]"
                :style="[titleStyle]"
                :id="[titleId]"
            >
                {{ props.item.title }}
            </div>

            <div 
                :class="['BaseNotification__text', textClass]"
                :style="[textStyle]"
                :id="[textId]"
            >
                {{ props.item.text }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import IconClickable from "@/components/ui/icons/IconClickable.vue";

export default Vue.extend({
    components: {
        IconClickable
    },
    props: {
        // Passed in from Vue-Notifications
        props: {
            type: Object,
            required: true
        },
        // Style classes
        baseClass: {
            default: null
        },
        baseStyle: {
            default: null
        },
        baseId: {
            default: null
        },
        accentClass: {
            default: null
        },
        accentStyle: {
            default: null
        },
        accentId: {
            default: null
        },
        titleClass: {
            default: null
        },
        titleStyle: {
            default: null
        },
        titleId: {
            default: null
        },
        textClass: {
            default: null
        },
        textStyle: {
            default: null
        },
        textId: {
            default: null
        },
        closeClass: {
            default: null
        },
        closeStyle: {
            default: null
        },
        closeId: {
            default: null
        },
    }
});
</script>

<style lang="scss">
    $width: 330px;

    // Override the width styles that the library puts in
    // b/c by default the notification does not shrink when the screen is too small
    .vue-notification-group {
        max-width: $width !important;
        width: 100% !important;
    }

    .BaseNotification {
        $accent-size: 0.5rem;
        $radius-amount: 0.3rem;
        $padding-amount: 0.5rem;
        $padding-amount-sides: 0.5rem;

        position: relative;

        border-radius: $radius-amount;

        z-index: 1;

        margin: 0.52rem 0.5rem;

        box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.25);

        & .BaseNotification__accent {
            background-color: color-link("GLOBAL", "accent", "primary");
            border-radius: $radius-amount;

            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;

            z-index: -1;
        }

        & .BaseNotification__base {
            position: relative;

            display: flex;
            flex-direction: row;
            align-items: center;

            // Note: this should be overrided by the components that use it
            background-color: color-link("GLOBAL", "background", "secondary");

            border-radius: $radius-amount;

            margin: 0 $accent-size 0 $accent-size;

            padding: 1.5rem 2.5rem 1.5rem 1rem;

            & .BaseNotification__close {
                position: absolute;
                top: 0;
                right: 0;

                margin: 0.2rem;
            }

            & .BaseNotification__icon {
                margin-right: 0.5rem;
            }

            & .BaseNotification__title {
                font-weight: bold;
                margin-right: 0.4rem;
            }

            & .BaseNotification__text {
                font-size: 1.5rem;
            }
        }
    }

    @include transition-effect(slide-rr, 0.3s);
</style>
<template>
    <button-base
        class="ButtonSecondary"
        tag="button"
        @click="$emit('click', $event)"
        v-bind="$attrs"
    >
        <div class="ButtonSecondary__accent ButtonSecondary__accent-left"></div>
        <div class="ButtonSecondary__accent ButtonSecondary__accent-right"></div>
        <slot></slot>
    </button-base>
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonBase from "@/components/ui/button/ButtonBase.vue";

export default Vue.extend({
    components: {
        ButtonBase
    }
});
</script>

<style lang="scss">
    .ButtonSecondary {
        $accent-size: 0.5rem;
        $radius-amount: 0.5rem;
        $modifer-duration: 0.5s;
        $accent-move: 2px;

        position: relative;
        z-index: 1;

        font-size: 1.7rem;

        border-radius: $radius-amount;

        color: color-link("ButtonSecondary", "text", "primary");
        background: none;

        transition: color $modifer-duration;

        & a {

            margin: 0 $accent-size 0 $accent-size;

            background-color: color-link("ButtonSecondary", "background", "primary");

            padding: 0.5rem 2.5rem 0.5rem 2.5rem;

            border-radius: $radius-amount;

            box-shadow: 0px 2px 6px 0px rgba(65, 65, 65, 0.27);

            transition: background-color $modifer-duration;
        }

        & .ButtonSecondary__accent {
            position: absolute;
            top: 0; 
            height: 100%;
            width: 10px;

            z-index: -1;

            background-color: color-link("ButtonSecondary", "accent", "secondary");

            transition: transform $modifer-duration, background-color $modifer-duration, box-shadow $modifer-duration;
        }

        & .ButtonSecondary__accent-left {
            left: 0;

            border-radius: $radius-amount 0 0 $radius-amount;

            box-shadow: -2px 0px 4px 0px color-link("ButtonSecondary", "accent", "secondary", 0.4);
        }

        & .ButtonSecondary__accent-right {
            right: 0;
            
            border-radius: 0 $radius-amount $radius-amount 0;
            
            box-shadow: 2px 0px 4px 0px color-link("ButtonSecondary", "accent", "secondary", 0.4);
        }

        &.disabled {
            color: color-link("ButtonSecondary", "text", "disabled");

            & a {
                background-color: color-link("ButtonSecondary", "background", "disabled");
            }

            & .ButtonSecondary__accent {
                background-color: color-link("ButtonSecondary", "accent", "disabled");
            }
        }   

        &:hover:not(.disabled) {
            & a {
                background-color: color-link("ButtonSecondary", "accent", "tertiary");
            }
        }

        &:active:not(.disabled) {
            & a {
                background-color: color-link("ButtonSecondary", "selected", "secondary");

                transition: background-color $modifer-duration;
            }

            & .ButtonSecondary__accent {
                background-color: color-link("ButtonSecondary", "selected", "primary");
            }

            & .ButtonSecondary__accent-left {
                transform: translateX(calc(1 * #{$accent-move}));
                box-shadow: -2px 0px 4px 0px color-link("ButtonSecondary", "selected", "primary", 0.4);
            }

            & .ButtonSecondary__accent-right {
                transform: translateX(calc(-1 * #{$accent-move}));
                box-shadow: 2px 0px 4px 0px color-link("ButtonSecondary", "selected", "primary", 0.4);
            }
        }
    }
</style>
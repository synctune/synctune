<template>
    <div 
        :class="[
            'MiniIconButton',
            (disabled) ? 'disabled' : null
        ]"
        :style="baseStyles"
        @click="onClick"
    >
        <icon-base 
            class="MiniIconButton__icon"
            :icon-name="iconName"
            :size="iconSize"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../../utilities";

import IconBase from "@/components/ui/icons/IconBase.vue";

interface Props {
    size: string;
    disabled: boolean;
    iconSize: string;
    iconName: string;
}

export default Vue.extend({
    components: {
        IconBase
    },
    props: {
        size: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "2rem"
        },
        disabled: {
            type: Boolean,
            default: false
        },
        iconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "1.8rem"
        },
        iconName: {
            type: String,
            required: true
        }
    },
    computed: {
        baseStyles() {
            const { size }: Props = this;

            return {
                width: size,
                height: size
            }
        }
    },
    methods: {
        onClick(e: MouseEvent) {
            const { disabled }: Props = this;

            if (disabled) {
                e.preventDefault();
                return;
            }

            this.$emit("click", e);
        }
    }
});
</script>

<style lang="scss">
    $size: 3rem;
    $outline-thickness: 1px;
    $anim-time: 0.3s;

    .MiniIconButton {
        flex-grow: 0;
        flex-shrink: 0;

        display: flex;
        justify-content: center;
        align-items: center;

        width: $size;
        height: $size;

        margin: $size / 10;

        color: color-link("MiniIconButton", "text", "primary");

        box-shadow: 0 0 0 $outline-thickness color-link("MiniIconButton", "accent", "primary");
        border-radius: 50%;

        cursor: pointer;

        transition: box-shadow $anim-time, color $anim-time;

        & .MiniIconButton__icon {
            width: 100%;
            height: 100%;
        }

        &.disabled {
            color: color-link("MiniIconButton", "text", "disabled");
            box-shadow: 0 0 0 $outline-thickness color-link("MiniIconButton", "accent", "primary", 0.5);

            pointer-events: none;
        }

        &:hover:not(.disabled) {
            color: color-link("MiniIconButton", "text", "secondary");
            box-shadow: 0 0 0 $outline-thickness color-link("MiniIconButton", "accent", "secondary");
        }

        &:active:not(.disabled) {
            color: color-link("MiniIconButton", "text", "tertiary");
            box-shadow: 0 0 0 $outline-thickness color-link("MiniIconButton", "selected", "primary");
        }
    }
</style>
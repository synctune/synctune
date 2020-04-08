<template>
    <!-- Router-link -->
    <router-link
        v-if="useRouterLink"
        :class="['Button', { disabled: disabled }]"
        :to="to"
        :tag="tag"
    >
        <a 
            :style="widthConstraintStyles"
            @click="onClick"
        >
            <slot></slot>
        </a>
    </router-link>
    <!-- Custom component -->
    <component 
        :is="tag" 
        v-else
        :class="['Button', { disabled: disabled }]"
    >
        <a 
            :href="href"
            :style="widthConstraintStyles"
            @click="onClick"
        >
            <slot></slot>
        </a>
    </component> 
</template>

<script lang="ts">
import { CSSLength } from "../../../validators";

interface Props {
    minWidth: string;
    disabled: boolean;
    to: string | null;
    href: string | null;
    tag: string;
}

interface Methods {
    onClick(e: MouseEvent): void;
}

export default {
    props: {
        minWidth: {
            type: String, 
            validator: CSSLength,
            default: "8rem"
        },
        disabled: {
            type: Boolean,
            default: false
        },
        to: {
            type: String,
            default: null
        },
        href: {
            type: String,
            default: null
        },
        tag: {
            type: String,
            default: "div"
        }
    },
    computed: {
        widthConstraintStyles() {
            const { minWidth }: Props = this;
            return {
                minWidth: minWidth
            }
        },
        useRouterLink() {
            const { to }: Props = this;
            return !!to;
        }
    },
    methods: {
        onClick(e: MouseEvent) {
            const { disabled }: Props = this;

            if (disabled) {
                e.preventDefault();
                return;
            }
            this.$emit('click', e);
        }
    }
}
</script>

<style lang="scss">
    .Button {
        display: inline-block;

        // TODO: cleanup

        // font-weight: 600;

        // color: color-link("ButtonBase", "text_color", "primary");
        // background-color: color-link("ButtonBase", "accent_color", "primary");

        // transition: background-color 0.5s;

        border: 0;
        outline: none;
        // border-radius: 0.7rem;

        text-align: center;

        & > a {
            cursor: pointer;
            display: inline-block;
            // padding: 1rem 3rem;
            
            text-decoration: none;
            // color: color-link("ButtonBase", "text_color", "primary");
        }

        &:hover {
            // background-color: color-link("ButtonBase", "selected_color", "primary");
        }

        &.disabled, &:disabled {
            & > a {
                cursor: initial;
                // color: color-link("ButtonBase", "text_color", "secondary");
            }

            // background-color: color-link("ButtonBase", "disabled_color", "primary");

            &:hover {
                // background-color: color-link("ButtonBase", "disabled_color", "primary");
            }
        }
    }
</style>
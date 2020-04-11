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

        border: 0;
        outline: none;

        text-align: center;

        & > a {
            cursor: pointer;
            display: inline-block;
            
            text-decoration: none;
        }

        &.disabled, &:disabled {
            & > a {
                cursor: initial;
            }
        }
    }
</style>
<template>
    <icon-base
        :class="['IconClickable', disabled ? 'disabled' : '']"
        v-bind="$attrs"
        @click="onClick"
    ></icon-base>
</template>

<script lang="ts">
import Vue from 'vue';
import IconBase from "@/components/ui/icons/IconBase.vue";

interface Props {
    disabled: boolean;
}

export default Vue.extend({
    components: {
        iconBase: IconBase
    },
    props: {
        disabled: {
            type: Boolean,
            default: false
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
});
</script>

<style lang="scss">
    .IconClickable {
        $duration: 0.15s;

        color: color-link("GLOBAL", "text", "primary");
        cursor: pointer;

        transition: color $duration;

        & i {
            transition: color $duration;
        }

        &:hover {
            color: color-link("GLOBAL", "text", "tertiary");
        }

        &.disabled {
            cursor: inherit;

            color: color-link("GLOBAL", "text", "disabled");

            &:hover {
                color: color-link("GLOBAL", "text", "disabled");
            }
        }
    }
</style>
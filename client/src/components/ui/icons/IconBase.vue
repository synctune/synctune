<template>
    <div 
        class="BaseIcon"
        :style="styles"
    >
        <component 
            class="BaseIcon__container"
            @click="$emit('click', $event)"
            :is="iconNameNormalized"
        ></component>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../../utilities";

interface Props {
    iconName: string;
    size: string;
}

export default Vue.extend({
    props: {
        size: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "3rem"
        },
        iconName: {
            type: String,
            required: true
        }
    },
    computed: {
        iconNameNormalized() {
            const { iconName }: Props = this;

            if (!iconName.endsWith("-icon") && !iconName.endsWith("Icon")) {
                return `${iconName}-icon`;
            }

            return iconName;
        },
        styles() {
            const { size }: Props = this;

            return {
                height: size,
                width: size
            }
        }
    }
});
</script>

<style lang="scss">
    .BaseIcon {
        display: flex;

        & .BaseIcon__container {
            width: 100%;
            height: 100%;
        }

        & svg {
            display: block;

            width: 100%;
            height: 100%;
        }
    }
</style>
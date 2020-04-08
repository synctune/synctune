<template>
    <div class="BaseMode">
        <icon-base 
            class="BaseMode__icon"
            :icon-name="iconName"
            :size="iconSize"
        />
        <div class="BaseMode__outline">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../../../utilities";

import IconBase from "@/components/ui/icons/IconBase.vue";

interface Props {
    iconSize: string;
    iconName: string;
}

export default Vue.extend({
    components: {
        IconBase
    },
    props: {
        iconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "1.8rem"
        },
        iconName: {
            type: String,
            required: true
        },
    },
});
</script>

<style lang="scss">
    .BaseMode {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        border-radius: 50%;

        & .BaseMode__icon {
            position: absolute;
            left: 50%;
            top: 50%;

            transform: translate(-50%, -50%);
        }

        & .BaseMode__outline {
            width: 100%;
            height: 100%;
        }
    }
</style>
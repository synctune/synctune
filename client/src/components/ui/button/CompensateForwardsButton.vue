<template>
    <circular-button 
        class="CompensateForwardsButton"
        :size="size"
        :disabled="disabled"
        v-bind="$attrs"
        @click="$emit('click', $event)"
    >
        <div class="CompensateForwardsButton__container">
            <icon-base 
                class="CompensateForwardsButton__redo-icon"
                v-bind="$attrs"
                :size="primaryIconSize"
                icon-name="redo-icon"
            />

            <icon-base 
                class="CompensateForwardsButton__plus-icon"
                v-bind="$attrs"
                :size="secondaryIconSize"
                icon-name="plus-icon"
            />
        </div>
    </circular-button>
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../../utilities";

import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";

export default Vue.extend({
    components: {
        CircularButton,
        IconBase
    },
    props: {
        disabled: {
            type: Boolean,
            default: true
        },
        size: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "4rem"
        },
        primaryIconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "2rem"
        },
        secondaryIconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "0.7rem"
        },
    }
});
</script>

<style lang="scss">
    .CompensateForwardsButton {
        & .CompensateForwardsButton__container {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        }
    }
</style>
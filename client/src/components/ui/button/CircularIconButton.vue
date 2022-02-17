<template>
    <circular-button 
        class="CircularIconButton"
        v-bind="$attrs"
        @click="$emit('click', $event)"
    >
        <icon-base 
            class="CircularIconButton__icon"
            :icon-name="iconName"
            :size="iconSize"
        />
    </circular-button>
</template>

<script lang="ts">
import Vue from 'vue';
import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";
import * as Utilities from "../../../utilities";

interface Props {
    iconSize: string;
    iconName: string;
}

export default Vue.extend({
    components: {
        CircularButton,
        IconBase
    },
    props: {
        iconSize: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "3rem"
        },
        iconName: {
            type: String,
            required: true
        }
    }
});
</script>

<style lang="scss">
    .CircularIconButton {
        display: flex;
        justify-content: center;
        align-items: center;

        & .CircularIconButton__icon {
            width: 100%;
            height: 100%;
        }
    }
</style>
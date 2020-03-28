<template>
    <div class="ButtonInputHybrid">
        <button-primary
            class="ButtonInputHybrid__button"
            @click="onButtonClick"
            :disabled="buttonDisabled"
            disabled-overlay-class="ButtonInputHybrid__button-disabled-overlay"
        >
            <slot></slot>
        </button-primary>

        <input-field 
            class="ButtonInputHybrid__input"
            :placeholder="inputPlaceholder"
            :disabled="inputDisabled"
            :value="value"
            @input="updateInputValue"
            @blur="$emit('blur')"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonPrimary from "@/components/ui/button/ButtonPrimary.vue";
import InputField from "@/components/ui/forms/InputField.vue";

interface Props {
    buttonDisabled: boolean;
    inputDisabled: boolean;
}

export default Vue.extend({
    components: {
        ButtonPrimary,
        InputField
    },
    props: {
        buttonDisabled: {
            type: Boolean,
            default: false
        },
        inputDisabled: {
            type: Boolean,
            default: false
        },
        inputPlaceholder: {
            type: String,
            default: ""
        },
        // v-model passthrough stuff
        value: String,
    },
    methods: {
        onButtonClick(e: MouseEvent) {
            const { buttonDisabled }: Props = this;

            if (buttonDisabled) {
                e.preventDefault();
                return;
            }

            this.$emit("button-click", e);
        },
        updateInputValue(value: any) {
            this.$emit("input", value);
        }
    }
});
</script>

<style lang="scss" scoped>
    .ButtonInputHybrid {
        display: flex;
        flex-direction: column;

        & /deep/ .ButtonInputHybrid__button {
            border-radius: 0.5rem 0.5rem 0 0;

            & .ButtonInputHybrid__button-disabled-overlay {
                border-radius: 0.5rem 0.5rem 0 0;
            }
        }

        & .ButtonInputHybrid__input {
            text-align: center;

            border-radius: 0 0 0.5rem 0.5rem;

            &:focus {
                border-top: 0.1rem solid color-link("InputField", "accent", "secondary", 0);
            }
        }
    }
</style>
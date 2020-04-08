<template>
    <input 
        class="InputField"
        v-bind="$attrs"
        :type="type" 
        :disabled="disabled"
        :value="value"
        @input="updateValue"
        @change="updateValue"
        @blur="$emit('blur')"
    >
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    props: {
        type: {
            type: String,
            default: "text",
            validator(val) {
                const validTypes = ["url", "text", "password", "email", "search"];
                return validTypes.indexOf(val) > -1;
            }
        },
        disabled: {
            type: Boolean,
            default: false
        },
        // v-model passthrough stuff
        value: String,
    },
    methods: {
        // v-model passthrough stuff
        updateValue(e: MouseEvent) {
            const target = e.target as HTMLInputElement;
            this.$emit("input", target.value);
        }
    }
});
</script>

<style lang="scss">
    .InputField {
        $transition-time: 0.5s;
        $blur-amount: 7px;

        font-size: 1.6rem;
        padding: .8rem;
        outline: none;

        border-radius: 0.5rem;

        color: color-link("InputField", "text", "primary");
        background-color: color-link("InputField", "background", "primary");

        border: 0.1rem solid color-link("InputField", "accent", "secondary", 0);
        box-shadow: 0px 2px $blur-amount 0px rgba(0, 0, 0, 0.2);

        transition: background-color $transition-time, box-shadow $transition-time, border $transition-time, color $transition-time;

        &:focus {
            border: 0.1rem solid color-link("InputField", "accent", "secondary", 1);
            box-shadow: 0px 2px $blur-amount 0px color-link("InputField", "accent", "primary", 0.4);
        }

        &:disabled {
            color: color-link("InputField", "text", "disabled");
            background-color: color-link("InputField", "background", "disabled");
        }
    }
</style>
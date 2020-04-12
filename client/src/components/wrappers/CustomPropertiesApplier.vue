<template>
    <component :is="tag" :style="cssStyles">
        <slot></slot>
    </component>
</template>


<script lang="ts">
import Vue from "vue";
import * as Utilities from "../../utilities";
import { GeneratedProperties } from "themer";

interface Props {
    properties: object;
    tag: string;
    useRoot: boolean;
    useEl: boolean;
    el: HTMLElement | undefined;
}

interface Data {
    currentlyUsingRoot: boolean;
}

interface Methods {
    validateProps(useRoot: boolean, useEl: boolean, el?: HTMLElement): never | void;
    updateRootStyles(useRoot: boolean, properties: GeneratedProperties): void;
    updateUseElementStyles(useRoot: boolean, el: HTMLElement | undefined, properties: GeneratedProperties): void;
}

export default Vue.extend({
    props: {
        properties: {
            type: Object,
            default() { return {} },
            validator(properties) {
                return Object.keys(properties).every((cssVarName) => {
                    return cssVarName.startsWith("--");
                });
            }
        },
        tag: {
            type: String,
            default: "div"
        },
        useRoot: {
            type: Boolean,
            default: false
        },
        useEl: {
            type: Boolean,
            required: false,
            default: undefined
        },
        el: {
            type: HTMLElement,
            required: false, 
            default: undefined
        }
    },
    data() {
        return {
            currentlyUsingRoot: false
        }
    },
    computed: {
        cssStyles() {
            const { useRoot, useEl, properties }: Props = this;
            return (useRoot || useEl) ? {} : { ...properties };
        }
    },
    watch: {
        // Watch for when useRoot changes
        useRoot(nextUseRoot: boolean) {
            const { useEl, el, properties }: Props = this;
            const { validateProps, updateRootStyles }: Methods = this;
            validateProps(nextUseRoot, useEl, el);
            updateRootStyles(nextUseRoot, properties);
        },
        // Watch for when useEl changes
        useEl(nextUseEl: boolean) {
            const { useRoot, el, properties }: Props = this;
            const { validateProps, updateUseElementStyles }: Methods = this;
            validateProps(useRoot, nextUseEl, el);
            updateUseElementStyles(nextUseEl, el, properties);
        },
        el(nextEl: HTMLElement) {
            this.validateProps(this.useRoot, this.useEl, nextEl);
            this.updateUseElementStyles(this.useEl, nextEl, this.properties);
        },
        // Watch for when properties changes (because of the async theme loading)
        properties(newProperties: object) {
            const { useRoot, useEl, el }: Props = this;
            const { updateRootStyles, updateUseElementStyles }: Methods = this;
            updateRootStyles(useRoot, newProperties);
            updateUseElementStyles(useEl, el, newProperties);
        }
    },
    created() {
        const { useRoot, useEl, el }: Props = this;
        const { validateProps }: Methods = this;
        validateProps(useRoot, useEl, el);
    },
    mounted() {
        const { useRoot, properties, useEl, el }: Props = this;
        const { updateRootStyles, updateUseElementStyles }: Methods = this;

        if (useRoot) {
            this.currentlyUsingRoot = true;
        }

        updateRootStyles(useRoot, properties);
        updateUseElementStyles(useEl, el, properties);
    },
    methods: {
        validateProps(useRoot: boolean, useEl: boolean, el?: HTMLElement) {
            const bothExist = !!useRoot && !!useEl;

            if (bothExist) {
                throw `Error: only one of props 'useRoot' and 'useEl' can be specified at once`;
            }

            if (useEl && !el) {
                throw `Error: el must be specified when useEl is 'true'`;
            }
        },
        updateRootStyles(useRoot: boolean, properties: GeneratedProperties) {
            if (useRoot) {
                Object.entries(properties).forEach(([name, value]) => {
                    Utilities.saveCSSProperty(name, value);
                });
                this.currentlyUsingRoot = true;
            }

            if (!useRoot && this.currentlyUsingRoot) {
                Object.keys(properties).forEach(name => {
                    Utilities.removeCSSProperty(name);
                });
                this.currentlyUsingRoot = false;
            }
        },
        updateUseElementStyles(useEl: boolean, el: HTMLElement | undefined, properties: GeneratedProperties) {
            const { useRoot }: Props = this;

            if (useRoot || !el) {
                return;
            }

            if (useEl) {
                Object.entries(properties).forEach(([name, value]) => {
                    Utilities.saveCSSProperty(name, value, el);
                });
            } else {
                Object.keys(properties).forEach(name => {
                    Utilities.removeCSSProperty(name, el);
                });
            }
        }
    }
});
</script>

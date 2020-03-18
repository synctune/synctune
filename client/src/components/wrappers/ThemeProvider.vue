<template>
    <custom-properties-applier 
        :properties="themeProperties"
        :tag="tag"
        :use-root="useRoot"
        :use-el="useEl"
        :el="el"
    >
        <slot></slot>
    </custom-properties-applier>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import * as ThemeStore from "../../store/modules/theme";

import CustomPropertiesApplier from '@/components/wrappers/CustomPropertiesApplier.vue';

interface Props {
    namespace: string | undefined;
    theme: string | undefined;
    tag: string;
    useRoot: boolean;
    useEl: boolean;
    el: HTMLElement | undefined;
}

type Computed = {
    themeProperties: ThemeStore.ThemeProperties;
} & Pick<ThemeStore.MapGettersStructure,
    ThemeStore.Getters.getNamespace
    | ThemeStore.Getters.getTheme
>

interface Methods {
    validateProps(namespace: string | undefined, theme: ThemeStore.ThemeName | undefined, useEl: boolean, el?: HTMLElement): never | void;
}

export default {
    components: {
        customPropertiesApplier: CustomPropertiesApplier
    },
    props: {
        namespace: { type: String, default: undefined },
        theme: { type: String, default: undefined },
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
            default: false
        },
        el: {
            type: HTMLElement,
            required: false,
            default: undefined
        }
    },
    computed: {
        ...mapGetters({
            getNamespace: ThemeStore.Getters.getNamespace,
            getTheme: ThemeStore.Getters.getTheme
        }),
        themeProperties() {
            const { namespace, theme, useEl, el }: Props = this;
            const { getNamespace: getTargetTheme, getTheme: getThemeData }: Computed = this;
            const { validateProps }: Methods = this;

            // Everytime this is recomputed check the props
            validateProps(namespace, theme, useEl, el);

            // Get the related theme data
            const themeName = (namespace) ? getTargetTheme(namespace) : theme;
            const themeData = getThemeData(themeName!);

            return (themeData) ? themeData["properties"] : {};
        }
    },
    watch: {
        namespace(nextNamespace: string) {
            const { theme, useEl, el }: Props = this;
            const { validateProps }: Methods = this;
            validateProps(nextNamespace, theme, useEl, el);
        },
        theme(nextTheme: string) {
            const { namespace, useEl, el }: Props = this;
            const { validateProps }: Methods = this;
            validateProps(namespace, nextTheme, useEl, el);
        }
    },
    created() {
        const { namespace, theme, useEl, el }: Props = this;
        const { validateProps }: Methods = this;
        validateProps(namespace, theme, useEl, el);
    },
    methods: {
        // Makes sure the props are valid
        validateProps(namespace: string | undefined, theme: ThemeStore.ThemeName | undefined, useEl: boolean, el?: HTMLElement) {
            const bothExist = !!namespace && !!theme;
            const neitherExist = !namespace && !theme;

            if (bothExist) {
                throw `Error: only one of props 'namespace' and 'theme' can be specified at once`;
            }

            if (neitherExist) {
                throw `Error: one of props 'namespace' and 'theme' must be specified`;
            }

            if (useEl && !el) {
                throw `Error: el must be specified when useEl is 'true'`;
            }
        }
    }
}
</script>


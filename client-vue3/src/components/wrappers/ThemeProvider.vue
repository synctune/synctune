<template>
  <CustomPropertiesApplier
    :properties="themeProperties"
    :tag="tag"
    :use-root="useRoot"
    :use-el="useEl"
    :el="el"
  >
    <slot></slot>
  </CustomPropertiesApplier>
</template>

<script setup lang="ts">
import CustomPropertiesApplier from "@/components/wrappers/CustomPropertiesApplier.vue";
import { useThemeStore } from "@/stores/theme";
import type { ThemeName } from "@/stores/theme";
import { computed, onBeforeMount, watch } from "vue";

const props = withDefaults(
  defineProps<{
    namespace?: string;
    theme?: string;
    tag?: string;
    useRoot?: boolean;
    useEl?: boolean;
    el?: HTMLElement;
  }>(),
  {
    tag: "div",
    useRoot: false,
    useEl: false,
  }
);

const themeStore = useThemeStore();

const validateProps = (
  namespace: string | undefined,
  theme: ThemeName | undefined,
  useEl: boolean,
  el?: HTMLElement
) => {
  const bothExist = !!namespace && !!theme;
  const neitherExist = !namespace && !theme;

  if (bothExist)
    throw `Error: only one of props 'namespace' and 'theme' can be specified at once`;

  if (neitherExist)
    throw `Error: one of props 'namespace' and 'theme' must be specified`;

  if (useEl && !el) throw `Error: el must be specified when useEl is 'true'`;
};

const themeProperties = computed(() => {
  // Every time this is recomputed check the props
  validateProps(props.namespace, props.theme, props.useEl, props.el);

  // Get the related theme data
  const themeName = props.namespace
    ? themeStore.getNamespace(props.namespace)!
    : props.theme!;
  const themeData = themeStore.getTheme(themeName);

  return themeData ? themeData["properties"] : {};
});

onBeforeMount(() => {
  validateProps(props.namespace, props.theme, props.useEl, props.el);
});

watch(
  () => [props.namespace, props.theme],
  ([nextNamespace, nextTheme]) => {
    validateProps(nextNamespace, nextTheme, props.useEl, props.el);
  }
);
</script>

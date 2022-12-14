<template>
  <component :is="tag" :style="cssStyles">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import type { GeneratedProperties } from "themer";
import * as Utilities from "@/utilities";

const props = withDefaults(
  defineProps<{
    properties: object;
    tag: string;
    useRoot?: boolean;
    useEl?: boolean;
    el?: HTMLElement;
  }>(),
  {
    useRoot: false,
    useEl: false,
  }
);

const currentlyUsingRoot = ref(false);

const validateProps = (useRoot: boolean, useEl: boolean, el?: HTMLElement) => {
  const bothExist = !!useRoot && !!useEl;

  if (bothExist)
    throw "Error: only one of props 'useRoot' and 'useEl' can be specified at once.";
  if (useEl && !el) throw "Error: 'el' must be specified when 'useEl' is true.";
};

const updateRootStyles = (
  useRoot: boolean,
  properties: GeneratedProperties
) => {
  if (useRoot) {
    Object.entries(properties).forEach(([name, value]) => {
      Utilities.saveCSSProperty(name, value);
    });
    currentlyUsingRoot.value = true;
  }

  if (!useRoot && currentlyUsingRoot.value) {
    Object.keys(properties).forEach((name) => {
      Utilities.removeCSSProperty(name);
    });
    currentlyUsingRoot.value = false;
  }
};

const updateUseElementStyles = (
  useEl: boolean,
  el: HTMLElement | undefined,
  properties: GeneratedProperties
) => {
  if (props.useRoot || !el) {
    return;
  }

  if (useEl) {
    Object.entries(properties).forEach(([name, value]) => {
      Utilities.saveCSSProperty(name, value, el);
    });
  } else {
    Object.keys(properties).forEach((name) => {
      Utilities.removeCSSProperty(name, el);
    });
  }
};

onBeforeMount(() => {
  validateProps(props.useRoot, props.useEl, props.el);
});

onMounted(() => {
  if (props.useRoot) currentlyUsingRoot.value = true;

  updateRootStyles(props.useRoot, props.properties);
  updateUseElementStyles(props.useEl, props.el, props.properties);
});

const cssStyles = computed(() => {
  return props.useRoot || props.useEl ? {} : { ...props.properties };
});

// Watch for when useRoot changes
watch(
  () => props.useRoot,
  (nextUseRoot) => {
    validateProps(nextUseRoot, props.useEl, props.el);
    updateRootStyles(nextUseRoot, props.properties);
  }
);

// Watch for when useEl or el changes
watch([() => props.useEl, () => props.el], ([nextUseEl, nextEl]) => {
  validateProps(props.useRoot, nextUseEl, nextEl);
  updateUseElementStyles(nextUseEl, nextEl, props.properties);
});

// Watch for when properties changes (because of the async theme loading)
watch(
  () => props.properties,
  (newProperties) => {
    updateRootStyles(props.useRoot, newProperties);
    updateUseElementStyles(props.useEl, props.el, newProperties);
  }
);
</script>

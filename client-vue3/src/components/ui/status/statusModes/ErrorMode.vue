<template>
  <BaseMode class="ErrorMode" :icon-size="props.iconSize">
    <template #icon>
      <CloseIcon />
    </template>
    <template #default>
      <SvgRing
        class="ErrorMode__ring"
        :radius="props.radius"
        :stroke="props.stroke"
      />
    </template>
  </BaseMode>
</template>

<script setup lang="ts">
import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import SvgRing from "@/components/ui/rings/SvgRing.vue";
import CloseIcon from "vue-material-design-icons/Close.vue";

const props = withDefaults(
  defineProps<{
    // BaseMode props
    iconSize?: string;
    // SVG ring props
    radius?: number;
    stroke?: number;
  }>(),
  {}
);
</script>

<style lang="scss">
.ErrorMode {
  & .ErrorMode__ring circle {
    stroke: color-link("ErrorMode", "sync_status", "error");
  }
}
</style>

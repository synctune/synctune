<template>
  <BaseMode class="ReadyMode" :icon-size="props.iconSize">
    <template #icon>
      <CheckIcon />
    </template>
    <template #default>
      <SvgRing
        class="ReadyMode__ring"
        :radius="props.radius"
        :stroke="props.stroke"
      />
    </template>
  </BaseMode>
</template>

<script setup lang="ts">
import BaseMode from "@/components/ui/status/statusModes/BaseMode.vue";
import SvgRing from "@/components/ui/rings/SvgRing.vue";
import CheckIcon from "vue-material-design-icons/CheckUnderline.vue";

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
.ReadyMode {
  & .ReadyMode__ring circle {
    stroke: color-link("ReadyMode", "sync_status", "ready");
  }
}
</style>

<template>
  <div class="UploadButton">
    <input
      :id="props.name"
      :class="['UploadButton__file-input', dialogOpen ? 'dialog-open' : null]"
      ref="fileInputRef"
      :disabled="props.disabled"
      type="file"
      @change="emit('change', $event)"
      @click="onClick"
    />
    <label class="UploadButton__overlay-label" :for="props.name">
      <div class="UploadButton__disabled-overlay"></div>
      <IconBase class="UploadButton__upload-icon" size="7rem">
        <UploadIcon />
      </IconBase>
    </label>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { assert } from "tsafe";
import IconBase from "@/components/ui/icons/IconBase.vue";
import UploadIcon from "vue-material-design-icons/UploadOutline.vue";

const props = withDefaults(
  defineProps<{
    name: string;
    disabled?: boolean;
  }>(),
  { disabled: false }
);

const emit = defineEmits<{
  (event: "change", e: Event): void;
}>();

const dialogOpen = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  const fileInputEl = fileInputRef.value;
  assert(fileInputEl !== null);
  fileInputEl.addEventListener("focusin", () => {
    if (dialogOpen.value) {
      dialogOpen.value = false;
    }
  });
});

const onClick = () => {
  if (props.disabled) return;

  if (!dialogOpen.value) dialogOpen.value = true;
};
</script>

<style lang="scss">
.UploadButton {
  position: relative;

  & .UploadButton__file-input {
    // Overlay the original file input over the entire component
    // in order to catch all click events
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    opacity: 0;

    & + .UploadButton__overlay-label {
      $hover-duration: 0.7s;
      $select-duration: 0.5s;

      $padding-amt: 2.5rem;

      display: inline-block;
      position: relative;

      border-radius: 50%;
      font-size: 2.3rem;
      padding: $padding-amt;

      background: color-link("UploadButton", "gradient", "start");
      background: linear-gradient(
        135deg,
        color-link("UploadButton", "gradient", "start") 0%,
        color-link("UploadButton", "gradient", "end") 100%
      );

      box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.25);

      z-index: 0;

      cursor: pointer;

      & .UploadButton__upload-icon {
        color: color-link("UploadButton", "text", "primary");

        transition: color $hover-duration;
      }

      &::before {
        content: "";
        border-radius: inherit;
        display: block;

        background: color-link("UploadButton", "gradient", "end");
        background: linear-gradient(
          135deg,
          color-link("UploadButton", "gradient", "end") 0%,
          color-link("UploadButton", "gradient", "start") 100%
        );

        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;

        opacity: 0;

        z-index: -1;

        transition: opacity $hover-duration;
      }

      &::after {
        content: "";
        border-radius: inherit;
        display: block;

        background: color-link("UploadButton", "gradient_selected", "start");
        background: linear-gradient(
          135deg,
          color-link("UploadButton", "gradient_selected", "start") 0%,
          color-link("UploadButton", "gradient_selected", "end")
        );

        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;

        opacity: 0;

        z-index: -1;

        transition: opacity $select-duration;
      }

      & .UploadButton__disabled-overlay {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;

        background: color-link("UploadButton", "gradient_disabled", "start");
        background: linear-gradient(
          135deg,
          color-link("UploadButton", "gradient_disabled", "start") 0%,
          color-link("UploadButton", "gradient_disabled", "end") 100%
        );

        border-radius: 50%;

        pointer-events: none;

        opacity: 0;

        z-index: -1;

        transition: opacity $select-duration;
      }
    }

    &:disabled + .UploadButton__overlay-label {
      pointer-events: none;

      & .UploadButton__upload-icon {
        color: color-link("UploadButton", "text", "disabled");
      }

      & .UploadButton__disabled-overlay {
        opacity: 1;
      }
    }

    &:hover:not(:disabled) + .UploadButton__overlay-label {
      &::before {
        opacity: 1;
      }
    }

    &:active:not(:disabled) + .UploadButton__overlay-label,
    &.dialog-open:not(:disabled) + .UploadButton__overlay-label {
      &::before {
        opacity: 0;
      }

      &::after {
        opacity: 1;
      }
    }
  }
}
</style>

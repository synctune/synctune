<template>
  <CircularButton
    :class="['SyncButton', props.syncing ? 'syncing' : null]"
    :size="props.size"
    :disabled="props.syncing || props.disabled"
    @click="emit('click', $event)"
  >
    <!-- Sync icon -->
    <IconBase ref="syncIconRef" class="SyncButton__icon">
      <SyncIcon />
    </IconBase>

    <transition name="fade" mode="out-in">
      <div v-if="syncing && !disabled" class="SyncButton__loader-container">
        <!-- Sync loader/spinner -->
        <CircleLoader
          v-if="hasProgress"
          class="SyncButton__loader"
          :progress="syncProgress"
          :radius="sizePx / 2"
          :stroke="2"
        />
        <CircleSpinner
          v-else
          class="SyncButton__loader"
          :radius="sizePx / 2"
          :stroke="2"
        />
      </div>
    </transition>
  </CircularButton>
</template>

<script setup lang="ts">
import * as Validators from "@/validators";
import * as Utilities from "@/utilities";
import { computed, onMounted, ref, watch } from "vue";
import { assert } from "tsafe";
import { TweenLite } from "gsap";
import CircularButton from "@/components/ui/button/CircularButton.vue";
import IconBase from "@/components/ui/icons/IconBase.vue";
import CircleLoader from "@/components/ui/loaders/CircleLoader.vue";
import CircleSpinner from "@/components/ui/spinners/CircleSpinner.vue";
import SyncIcon from "vue-material-design-icons/Sync.vue";

const props = defineProps({
  size: {
    type: String,
    validator: Validators.CSSLength,
    default: "5rem",
  },
  iconSize: {
    type: String,
    validator: Validators.CSSLength,
    default: "3rem",
  },
  syncing: {
    type: Boolean,
    default: false,
  },
  syncProgress: {
    type: Number,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "click", e: MouseEvent): void;
}>();

const hasProgress = computed(() => props.syncProgress !== null);
const sizePx = computed(() => Utilities.remToPixel(props.size));

const syncIconRef = ref<HTMLElement | null>(null);

const startSyncingSpinAnim = () => {
  const syncIconEl = syncIconRef.value;
  assert(syncIconEl !== null);

  const runRotation = () => {
    const START_STATE = { rotation: 0 };

    const END_STATE = {
      rotation: -360,
      ease: "power1.inOut",
      onComplete: runRotation,
    };

    TweenLite.fromTo(syncIconEl, 1, START_STATE, END_STATE);
  };

  runRotation();
};

const stopSyncingSpinAnim = () => {
  const syncIconEl = syncIconRef.value;
  assert(syncIconEl !== null);

  TweenLite.killTweensOf(syncIconEl);

  TweenLite.to(syncIconEl, 0.5, {
    rotation: 0,
    ease: "power1.out",
  });
};

watch(
  () => props.syncing,
  (newSyncing) => {
    if (newSyncing == true && props.disabled == false) {
      startSyncingSpinAnim();
    } else if (newSyncing == false) {
      stopSyncingSpinAnim();
    }
  }
);

watch(
  () => props.disabled,
  (newDisabled) => {
    if (newDisabled == true) {
      stopSyncingSpinAnim();
    }
  }
);

onMounted(() => {
  if (props.syncing == true && props.disabled == false) {
    startSyncingSpinAnim();
  }
});
</script>

<style lang="scss">
$spin-reset-time: 1s;
$spin-duration: 1s;

.SyncButton {
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  & .SyncButton__icon {
  }

  & .SyncButton__loader-container {
    position: absolute;
    top: 0;
    left: 0;

    & .SyncButton__loader circle {
      stroke: color-link("SyncButton", "sync_status", "syncing");
    }
  }

  &.syncing {
    & .SyncButton__icon {
    }
  }
}

// Transition effects
@include transition-effect(fade, 0.3s);
</style>

<template>
    <icon-clickable 
        class="NextButton"
        :size="size"
        v-bind="$attrs"
        icon-name="next-icon"
        @click="$emit('click', $event)"
    />
</template>

<script lang="ts">
import Vue from 'vue';
import * as Utilities from "../../../utilities";

import IconClickable from "@/components/ui/icons/IconClickable.vue";

export default Vue.extend({
    components: {
        IconClickable
    },
    props: {
        size: {
            type: String,
            validator: Utilities.isCSSLength,
            default: "4rem"
        },
    }
});
</script>
<template>
    <div class="home">
        <room-connection-form />
    </div>
</template>

<script>
import RoomConnectionForm from "@/components/RoomConnectionForm.vue";

export default {
    name: "Home",
    components: {
        RoomConnectionForm
    }
};
</script>

<template>
    <div class="home">
        <room-connection-form />

        <br>

        <container :vertical-accents="false">
            Hi
            <br>
            Hi
            <br>
            Hi
            <br>
            Hi
            <br>
            Hi
            <br>
        </container>
    </div>
</template>

<script>
import RoomConnectionForm from "@/components/RoomConnectionForm.vue";
import Container from "@/components/ui/Container.vue";

export default {
    name: "Home",
    components: {
        RoomConnectionForm,
        Container
    }
};
</script>

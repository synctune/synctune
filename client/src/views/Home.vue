<template>
    <div id="Home">
        <room-connection-form 
            id="Home__room-connection-form"
        />
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

<style lang="scss" scoped>
    #Home {
        display: flex;
        flex-direction: column;
        align-items: center;

        #Home__room-connection-form {

        }
    }
</style>
<template>
    <div id="PageNotFound">
        <div id="PageNotFound__content">
            <div id="PageNotFound__title">
                404
            </div>
            
            <div id="PageNotFound__text">
                Page Not Found
            </div>

            <button-secondary 
                id="PageNotFound__home-button"
                to="/"
            >
                Back to Home
            </button-secondary>
        </div>
    </div>    
</template>

<script lang="ts">
import Vue from 'vue';
import ButtonSecondary from "@/components/ui/button/ButtonSecondary.vue";

export default Vue.extend({
    components: {
        ButtonSecondary
    }
});
</script>

<style lang="scss">
    #PageNotFound {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        & #PageNotFound__content {
            text-align: center;

            & #PageNotFound__title {
                font-size: 5rem;
                font-weight: 600;
            }

            & #PageNotFound__text {
                font-size: 2rem;

                margin-bottom: 3rem;
            }
        }
    }
</style>
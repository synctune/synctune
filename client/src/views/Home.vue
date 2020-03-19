<template>
    <div id="Home">
        <div id="Home__logo">
            <div id="Home__app-name">
                <span id="Home__name-light">Sync&nbsp;</span>
                <span id="Home__name-bold">Tune</span>
            </div>
            <div id="Home__app-slogan">
                <span id="Home__slogan-light">Extend Your</span>
                <span id="Home__slogan-bold">&nbsp;Sound</span>
            </div>
        </div>

        <room-connection-form 
            id="Home__room-connection-form"
        />

        <!-- Used to level out where flexbox puts the room-connection-form on the screen -->
        <div id="Home__placeholder"></div>
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
        justify-content: space-evenly;

        flex-grow: 1;

        & #Home__logo {
            padding: 0 1.5rem;

            & #Home__app-name {
                $font-size: 7rem;

                display: flex;
                flex-direction: row;
                justify-content: center;
                flex-wrap: wrap;

                font-size: $font-size;
                line-height: $font-size - 0.7rem;

                white-space: pre-wrap;

                @include respond(phone) {
                    $font-size: 6rem;
                    font-size: $font-size;
                    line-height: $font-size - 0.7rem;
                }
            }

            & #Home__app-slogan {
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                flex-wrap: wrap;

                white-space: pre-wrap;
            }

            & #Home__name-light, & #Home__slogan-light {
                color: color-link("Home", "text", "primary");
                font-weight: 400;
            }

            & #Home__name-bold, & #Home__slogan-bold {
                color: color-link("Home", "accent", "tertiary");
                font-weight: 600;
            }

            & #Home__slogan-bold, & #Home__slogan-light {
                text-align: right;
            }
        }

        & #Home__room-connection-form {
            $margin-size: 1.5rem;

            margin: 0 $margin-size 0 $margin-size;
            width: calc(100% - 2*#{$margin-size});
        }
    }
</style>
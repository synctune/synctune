<template>
    <div id="Home">
        <div 
            id="Home__crowd-image"
            :style="crowdImageStyles"
        ></div>

        <div id="Home__logo-container">
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
        </div>

        <room-connection-form 
            id="Home__room-connection-form"
        />
        
        <!-- Used to level out where flexbox puts the room-connection-form on the screen -->
        <div id="Home__placeholder"></div>
    </div>
</template>

<script lang="ts">
import RoomConnectionForm from "@/components/room/RoomConnectionForm.vue";

import Vue from 'vue';
export default Vue.extend({
    name: "Home",
    components: {
        RoomConnectionForm
    },
    computed: {
        crowdImageStyles() {
            return {
                backgroundImage: `url(${require("@/assets/crowd.png")})`
            }
        }
    }
});
</script>

<style lang="scss">
    #Home {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;

        flex-grow: 1;

        & #Home__crowd-image {
            position: absolute;
            bottom: 0;
            left: 0;

            width: 100%;
            height: 100%;

            background-position: bottom center;
            background-repeat: no-repeat;
            background-size: 100%, 40rem;

            animation-name: image-hue-anim;
            animation-duration: 30s;
            animation-iteration-count: infinite;
            animation-direction: alternate;

            transition: filter 0.5s;

            pointer-events: none;

            z-index: 0;

            @keyframes image-hue-anim {
                $opacity-amount: 80%;
                $brightness-amount: 80%;

                0% {
                    filter: hue-rotate(0deg) opacity($opacity-amount) brightness($brightness-amount);
                }
                50% {
                    filter: hue-rotate(360deg) opacity($opacity-amount) brightness($brightness-amount);
                }
                100% {
                    filter: hue-rotate(0deg), opacity($opacity-amount) brightness($brightness-amount);
                }
            }
        }

        & #Home__logo-container {
            width: 75%;
            $final-opacity: 0.6;
            $cutoff: 45%;

            background: rgb(0,0,0);
            background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,$final-opacity) $cutoff, rgba(0,0,0,$final-opacity) 100% - $cutoff, rgba(0,0,0,0) 100%);

            color: color-link("Home", "text_inverted", "primary");

            @include respond(tab-port) {
                width: auto;   
                background: none;

                color: color-link("Home", "text", "primary");
            }

            display: flex;
            flex-direction: row;
            align-content: center;
            justify-content: center;

            z-index: 1;

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
        }

        & #Home__room-connection-form {
            $margin-size: 1.5rem;

            margin: 0 $margin-size 0 $margin-size;
            width: calc(100% - 2*#{$margin-size});
        }
    }
</style>
<template>
    <theme-provider 
        id="App"
        :namespace="defaultNamespace"
        use-root
    >
        <overlay-scrollbar 
            id="App__overlay-container"
            :options="{
                paddingAbsolute: true,
                scrollbars: {
                    autoHide: 'leave'
                }
            }"
        >
            <div id="App__container">
                <notification-register></notification-register>

                <!-- TODO: remove -->
                <!-- <div id="nav">
                    <router-link to="/">Home</router-link> |
                    <router-link to="/room">Room</router-link>
                </div> -->

                <transition name="fade" mode="out-in">
                    <router-view />
                </transition>

                <!-- Sticky components -->
                <room-status />
                <audio-player />
            </div>
        </overlay-scrollbar>
    </theme-provider>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from "vuex";
import * as ThemeStore from "./store/modules/theme";

import themes from "./theme/themes";

import ThemeProvider from "./components/wrappers/ThemeProvider.vue";
import RoomStatus from "./components/sticky/RoomStatus.vue";
import AudioPlayer from "./components/sticky/AudioPlayer.vue";
import { DEFAULT_NAMESPACE, DEFAULT_THEME } from "./constants/generalConstants";
import NotificationRegister from "@/registers/NotificationRegister.vue";

// No type declarations for these
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CSSPlugin, AttrPlugin } = require("gsap/all");

interface Data {
    defaultNamespace: string;
}

type Methods = {
    instantiateThemes(): void;
    instantiateNamespaces(): void;
} & Pick<ThemeStore.MapActionsStructure,
    ThemeStore.Actions.addTheme
    | ThemeStore.Actions.addNamespace
>

export default Vue.extend({
    components: {
        ThemeProvider,
        RoomStatus,
        AudioPlayer,
        NotificationRegister
    },
    data() {
        return {
            defaultNamespace: DEFAULT_NAMESPACE
        }
    },
    created() {
        const { instantiateThemes, instantiateNamespaces }: Methods = this;
        instantiateThemes();
        instantiateNamespaces();
    },
    mounted() {
        // NOTE: this prevents the CSSPlugin and the AttrPlugin from getting tree shaked
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const plugins = [ CSSPlugin, AttrPlugin ];
    },
    methods: {
        ...mapActions({
            addTheme: ThemeStore.Actions.addTheme,
            addNamespace: ThemeStore.Actions.addNamespace
        }),
        instantiateThemes() {
            const { addTheme }: Methods = this;

            // Add all the themes
            Object.values(themes).forEach((themeData) => {
                addTheme({
                    name: themeData.name,
                    themeValues: themeData.theme,
                    override: true
                });
            });
        },
        instantiateNamespaces() {
            const { addNamespace }: Methods = this;

            // Add default namespace
            addNamespace({
                name: DEFAULT_NAMESPACE,
                targetTheme: DEFAULT_THEME,
                override: true
            });
        }
    }
});
</script>

<style lang="scss">
    #App {
        height: 100%;
        width: 100%;

        & #App__overlay-container {
            height: 100%;

            position: relative;

            display: flex;
            flex-direction: column;

            $cutoff-point: 60%;
            background: color-link("App", "background_gradient", "start");
            background: linear-gradient(color-link("App", "background_gradient", "start") 0%, color-link("App", "background_gradient", "start") $cutoff-point, color-link("App", "background_gradient", "end"));

            & #App__container {
                position: relative;
                
                height: 100vh;

                display: flex;
                flex-direction: column;
            }
        }
    }

    // Transition effects
    @include transition-effect(fade, 0.3s);
</style>

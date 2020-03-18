<template>
    <theme-provider 
        id="App"
        :namespace="defaultNamespace"
        use-root
    >
        <div id="nav">
            <router-link to="/">Home</router-link> |
            <router-link to="/room">Room</router-link>
            <!-- TODO: remove these test links -->
            <!-- <router-link to="/test-rtc-camera-local">Test RTC Camera Local</router-link> |
            <router-link to="/test-rtc-audio-file-local">Test RTC Audio File Local</router-link> |
            <router-link to="/test-rtc-signalling-server">Test RTC Signalling Server</router-link> | -->
            <!-- <router-link to="/test-youtube">Test Youtube player</!-->
        </div>
        <router-view />

        <!-- Sticky components -->
        <room-status />
        <audio-player />
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
        AudioPlayer
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
        position: relative;
    }
</style>

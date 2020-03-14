import Vue from "vue";
import Vuex from "vuex";

import room from "./modules/room";
import audio from "./modules/audio";

Vue.use(Vuex);

export interface RootState {};

export default new Vuex.Store({
    state: {},
    modules: {
        room,
        audio
    }
});

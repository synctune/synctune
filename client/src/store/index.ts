import Vue from "vue";
import Vuex from "vuex";
import room from "./modules/room";


Vue.use(Vuex);

export interface RootState {};

export default new Vuex.Store({
    state: {},
    modules: {
        room
    }
});

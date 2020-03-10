import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import RoomManager from '@/rtc/RoomManager';
import { RootState } from "../../index";

// -------------------------
// --- Type Declarations ---
// -------------------------

export interface RoomState {
    roomManager?: RoomManager;
}

interface RoomManagerPayload {
    roomManager: RoomManager;
}

export enum Getters {
    roomManager = "roomManager",
    isConnected = "isConnected"
}

export enum Mutations {
    setRoomManager = "setRoomManager",
    deleteRoomManager = "deleteRoomManager"
}

export enum Actions {
    setRoomManager = "setRoomManager",
    deleteRoomManager = "deleteRoomManager"
}

export interface MapGettersStructure {
    [Getters.roomManager]: RoomManager | null;
    [Getters.isConnected]: boolean;
}

export interface MapMutationsStructure {
    [Actions.setRoomManager](payload: RoomManagerPayload): void;
    [Actions.deleteRoomManager](): void;
}

export interface MapActionsStructure {
    [Actions.setRoomManager](payload: RoomManagerPayload): void;
    [Actions.deleteRoomManager](): void;
}


// ------------------
// --- Room Store ---
// ------------------

const namespaced = false;

const state: RoomState = {};

const getters: GetterTree<RoomState, RootState> = {
    [Getters.roomManager](state): RoomManager | null {
        return (state.roomManager) ? state.roomManager : null;
    },
    [Getters.isConnected](state): boolean {
        return !!state.roomManager;
    }
};

const mutations: MutationTree<RoomState> = {
    [Mutations.setRoomManager](state, { roomManager }: RoomManagerPayload) {
        Vue.set(state, "roomManager", roomManager);
    },
    [Mutations.deleteRoomManager](state) {
        Vue.delete(state, "roomManager");
    }
};

const actions: ActionTree<RoomState, RootState> = {
    [Actions.setRoomManager]({ commit }, payload: RoomManagerPayload) {
        commit(Mutations.setRoomManager, payload);
    },
    [Actions.deleteRoomManager]({ commit }) {
        commit(Mutations.deleteRoomManager);
    }
};

const storeModule: Module<RoomState, RootState> = {
    namespaced,
    state,
    getters,
    mutations,
    actions
};

export default storeModule;
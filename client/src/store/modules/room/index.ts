import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import RoomManager from '@/rtc/RoomManager';
import { RootState } from "../../index";

// -------------------------
// --- Type Declarations ---
// -------------------------

export interface RoomState {
    roomManager?: RoomManager;
    connectedSocketClients: string[];
    connectedRTCClients: string[];
}

interface RoomManagerPayload {
    roomManager: RoomManager;
}

export enum Getters {
    roomManager = "roomManager",
    isConnected = "isConnected",
    isOwner = "isOwner",
    connectedSocketClients = "connectedSocketClients",
    connectedRTCClients = "connectedRTCClients",
    id = "id"
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
    [Getters.isOwner]: boolean;
    [Getters.connectedSocketClients]: string[];
    [Getters.connectedRTCClients]: string[];
    [Getters.id]: string | null;
}

export interface MapMutationsStructure {
    [Actions.setRoomManager](payload: RoomManagerPayload): void;
    [Actions.deleteRoomManager](): void;
}

export interface MapActionsStructure {
    [Actions.setRoomManager](payload: RoomManagerPayload): void;
    [Actions.deleteRoomManager](): void;
}


// ------------------------
// --- Helper Functions ---
// ------------------------
function resetState(state: RoomState) {
    Vue.delete(state, "roomManager");
    Vue.set(state, "connectedSocketClients", []);
    Vue.set(state, "connectedRTCClients", []);
}

function setupRoomManagerListeners(state: RoomState, roomManager: RoomManager) {
    // --- Setup Signalling Socket Listeners ---
    const signallingSocket = roomManager.signallingSocket;
    signallingSocket.on("client-joined", (_, clientId) => {
        // Add client to connected clients list
        if (state.connectedSocketClients.indexOf(clientId) < 0) {
            state.connectedSocketClients.push(clientId);
            Vue.set(state, "connectedSocketClients", state.connectedSocketClients);
        }
    });

    signallingSocket.on("client-left", (_, clientId) => {
        // Remove client from the clients list
        const idx = state.connectedSocketClients.indexOf(clientId);
        if (idx >= 0) Vue.delete(state.connectedSocketClients, idx);
    });

    signallingSocket.on("room-created", () => {
        // Add self
        Vue.set(state, "connectedSocketClients", [signallingSocket.id]);
    });

    signallingSocket.on("room-joined", (_, ownerId, clients) => {
        // Add other already connected clients + self
        Vue.set(state, "connectedSocketClients", [...clients, signallingSocket.id]);
    });

    signallingSocket.on("room-left", () => {
        Vue.set(state, "connectedSocketClients", []);
    });
    

    // --- Setup PeerManager listeners, when it is added ---
    roomManager.addEventListener("peermanagercreated", (peerManager) => {
        peerManager.addEventListener("rtcconnected", ({ clientId }) => {
            state.connectedRTCClients.push(clientId);
            Vue.set(state, "connectedRTCClients", state.connectedRTCClients);
        });

        peerManager.addEventListener("rtcdisconnected", ({ clientId }) => {
            const idx = state.connectedRTCClients.indexOf(clientId);
            if (idx >= 0) Vue.delete(state.connectedRTCClients, idx);
        });

        // peerManager.addEventListener("syncreceivechannelcreated", ({ clientId, sourceEvent: receiveChannel }) => {
        //     receiveChannel.addEventListener("close", () => {
        //         console.log("Close 1");
        //         const idx = state.connectedRTCClients.indexOf(clientId);
        //         if (idx >= 0) Vue.delete(state.connectedRTCClients, idx);
        //     });
        // });

        // peerManager.addEventListener("audioreceivechannelcreated", ({ clientId, sourceEvent: receiveChannel }) => {
        //     receiveChannel.addEventListener("close", () => {
        //         console.log("Close 2");
        //         const idx = state.connectedRTCClients.indexOf(clientId);
        //         if (idx >= 0) Vue.delete(state.connectedRTCClients, idx);
        //     });
        // });

        // TODO: remove
        // peerManager.addEventListener("rtcreceivechannelclose", ({ clientId }) => {
        //     const idx = state.connectedRTCClients.indexOf(clientId);
        //     if (idx >= 0) Vue.delete(state.connectedRTCClients, idx);
        // });
    });
}


// ------------------
// --- Room Store ---
// ------------------

const namespaced = false;

const state: RoomState = {
    connectedSocketClients: [],
    connectedRTCClients: []
};

const getters: GetterTree<RoomState, RootState> = {
    [Getters.roomManager](state): RoomManager | null {
        return (state.roomManager) ? state.roomManager : null;
    },
    [Getters.isConnected](state): boolean {
        return !!state.roomManager;
    },
    [Getters.isOwner](state): boolean {
        return (state.roomManager) ? state.roomManager.isOwner : false;
    },
    [Getters.connectedSocketClients](state): string[] {
        return state.connectedSocketClients;
    },
    [Getters.connectedRTCClients](state): string[] {
        return state.connectedRTCClients;
    },
    [Getters.id](state): string | null {
        return (state.roomManager) ? state.roomManager.id : null;
    }
};

const mutations: MutationTree<RoomState> = {
    [Mutations.setRoomManager](state, { roomManager }: RoomManagerPayload) {
        // Clean up current room manager if it exists as well as its peer manager
        state.roomManager?.peerManager?.clearListeners();
        state.roomManager?.clearListeners();

        // Reset the state
        resetState(state);

        // Setup listeners for the new room manager
        setupRoomManagerListeners(state, roomManager);

        // Set the new room manager
        Vue.set(state, "roomManager", roomManager);
    },
    [Mutations.deleteRoomManager](state) {
        // Clean up room manager and its peer manager
        state.roomManager?.peerManager?.clearListeners();
        state.roomManager?.clearListeners();

        // Reset the state
        resetState(state);
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
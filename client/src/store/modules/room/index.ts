import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import RoomManager from '@/rtc/RoomManager';
import { RootState } from "../../index";
import ConnectionManager from '@/rtc/ConnectionManager';
import { uuid } from "uuidv4";

// -------------------------
// --- Type Declarations ---
// -------------------------

// TODO: remove room manager stuff
// TODO: rename connectedSocketClients to connectedClients
// TODO: remove connectedRTCClients stuff

export interface RoomState {
    roomManager?: RoomManager;
    connectionManager: ConnectionManager;
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
    id = "id",
    connectionManager = "connectionManager"
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
    [Getters.connectionManager]: ConnectionManager;
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
            console.log("RTC Connected", clientId); // TODO: remove
            state.connectedRTCClients.push(clientId);
            Vue.set(state, "connectedRTCClients", state.connectedRTCClients);
        });

        peerManager.addEventListener("rtcdisconnected", ({ clientId }) => {
            console.log("RTC Disconnected", clientId); // TODO: remove
            const idx = state.connectedRTCClients.indexOf(clientId);
            if (idx >= 0) Vue.delete(state.connectedRTCClients, idx);
        });
    });
}

function setupConnectionManagerListeners(state: RoomState, connectionManager: ConnectionManager) {
    connectionManager.addEventListener("client-joined", ({ clientId }) => {
        // Add client to connected clients list
        if (state.connectedSocketClients.indexOf(clientId) < 0) {
            state.connectedSocketClients.push(clientId);
            Vue.set(state, "connectedSocketClients", state.connectedSocketClients);
        }
    });

    connectionManager.addEventListener("client-left", ({ clientId }) => {
        // Remove client from the clients list
        const idx = state.connectedSocketClients.indexOf(clientId);
        if (idx >= 0) Vue.delete(state.connectedSocketClients, idx);
    });

    connectionManager.addEventListener("room-created", () => {
        // Add self
        Vue.set(state, "connectedSocketClients", [connectionManager.id]);
    });

    connectionManager.addEventListener("room-joined", ({ clients }) => {
        // Add other already connected clients + self
        Vue.set(state, "connectedSocketClients", [...clients, connectionManager.id]);
    });

    connectionManager.addEventListener("room-left", () => {
        Vue.set(state, "connectedSocketClients", []);
    });
}

// ------------------
// --- Room Store ---
// ------------------

const namespaced = false;

const state: RoomState = {
    connectionManager: new ConnectionManager(uuid()),
    connectedSocketClients: [],
    connectedRTCClients: []
};

setupConnectionManagerListeners(state, state.connectionManager);

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
    },
    [Getters.connectionManager](state): ConnectionManager {
        return state.connectionManager;
    }
};

const mutations: MutationTree<RoomState> = {
    [Mutations.setRoomManager](state, { roomManager }: RoomManagerPayload) {
        // Clean up current room manager if it exists as well as its peer manager
        state.roomManager?.peerManager?.clearListeners();
        state.roomManager?.clearListeners();

        // Reset the state
        // resetState(state);

        // Setup listeners for the new room manager
        // setupRoomManagerListeners(state, roomManager);

        // Set the new room manager
        Vue.set(state, "roomManager", roomManager);
    },
    [Mutations.deleteRoomManager](state) {
        // Clean up room manager and its peer manager
        state.roomManager?.peerManager?.clearListeners();
        state.roomManager?.clearListeners();

        // Reset the state
        // resetState(state);
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
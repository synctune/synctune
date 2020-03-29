import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import { RootState } from "../../index";
import ConnectionManager from '@/rtc/ConnectionManager';
import { uuid } from "uuidv4";

// -------------------------
// --- Type Declarations ---
// -------------------------

export interface RoomState {
    isConnected: boolean;
    isOwner: boolean;
    connectionManager: ConnectionManager;
    connectedClients: string[];
    roomName: string;
    timesynced: boolean;
}

export enum Getters {
    isConnected = "isConnected",
    isOwner = "isOwner",
    connectedClients = "connectedClients",
    id = "id",
    connectionManager = "connectionManager",
    roomName = "roomName",
    timesynced = "timesynced"
}

export enum Mutations {}

export enum Actions {}

export interface MapGettersStructure {
    [Getters.isConnected]: boolean;
    [Getters.isOwner]: boolean;
    [Getters.connectedClients]: string[];
    [Getters.id]: string | null;
    [Getters.connectionManager]: ConnectionManager;
    [Getters.roomName]: string;
    [Getters.timesynced]: boolean;
}

export interface MapMutationsStructure {}

export interface MapActionsStructure {}


// ------------------------
// --- Helper Functions ---
// ------------------------
function setupConnectionManagerListeners(state: RoomState, connectionManager: ConnectionManager) {
    connectionManager.addEventListener("client-joined", ({ clientId }) => {
        // Add client to connected clients list
        if (state.connectedClients.indexOf(clientId) < 0) {
            state.connectedClients.push(clientId);
            Vue.set(state, "connectedClients", state.connectedClients);
        }
    });

    connectionManager.addEventListener("client-left", ({ clientId }) => {
        console.log("Room store: client left", clientId);
        // Remove client from the clients list
        const idx = state.connectedClients.indexOf(clientId);
        if (idx >= 0) Vue.delete(state.connectedClients, idx);
    });

    connectionManager.addEventListener("room-created", () => {
        // Add self
        Vue.set(state, "connectedClients", [connectionManager.id]);
        Vue.set(state, "isOwner", connectionManager.isOwner);
        Vue.set(state, "roomName", connectionManager.room);
        Vue.set(state, "timesynced", false);
    });

    connectionManager.addEventListener("room-joined", ({ clients }) => {
        // Add other already connected clients + self
        Vue.set(state, "connectedClients", [...clients, connectionManager.id]);
        Vue.set(state, "isOwner", connectionManager.isOwner);
        Vue.set(state, "roomName", connectionManager.room);
        Vue.set(state, "timesynced", false);
    });

    connectionManager.addEventListener("room-left", () => {
        Vue.set(state, "connectedClients", []);
        Vue.set(state, "isOwner", false);
        Vue.set(state, "roomName", "");
        Vue.set(state, "timesynced", false);
    });

    connectionManager.addEventListener("isconnectedchanged", (newIsConnected) => {
        Vue.set(state, "isConnected", newIsConnected);
    });

    connectionManager.addEventListener("timesyncchanged", (timesynced) => {
        Vue.set(state, "timesynced", timesynced);
    });
}

// ------------------
// --- Room Store ---
// ------------------

const namespaced = false;

const state: RoomState = {
    connectionManager: new ConnectionManager(uuid()),
    isConnected: false,
    isOwner: false,
    connectedClients: [],
    roomName: "",
    timesynced: false,
};

setupConnectionManagerListeners(state, state.connectionManager);

const getters: GetterTree<RoomState, RootState> = {
    [Getters.isConnected](state): boolean {
        return state.isConnected;
    },
    [Getters.isOwner](state): boolean {
        return state.isOwner;
    },
    [Getters.connectedClients](state): string[] {
        return state.connectedClients;
    },
    [Getters.id](state): string | null {
        return state.connectionManager.id;
    },
    [Getters.connectionManager](state): ConnectionManager {
        return state.connectionManager;
    },
    [Getters.roomName](state): string {
        return state.roomName;
    },
    [Getters.timesynced](state): boolean {
        return state.timesynced;
    }
};

const mutations: MutationTree<RoomState> = {};

const actions: ActionTree<RoomState, RootState> = {};

const storeModule: Module<RoomState, RootState> = {
    namespaced,
    state,
    getters,
    mutations,
    actions
};

export default storeModule;
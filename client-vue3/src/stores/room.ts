import ConnectionManager from "@/managers/ConnectionManager";
import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { computed, reactive } from "vue";

// -------------------------
// --- Type Declarations ---
// -------------------------

interface Client {
  id: string;
  nickname: string;
  uploadedChunks: number;
  state: "ready" | "uploading" | "loading" | "syncing" | "error";
  _prevState: "ready" | "uploading" | "loading" | "syncing" | "error";
  initialState: boolean;
}

const ROOM_STORE_TAG = "room-store";

export interface RoomState {
  isConnected: boolean;
  isOwner: boolean;
  connectionManager: ConnectionManager;
  connectedClients: Client[];
  roomName: string;
  timesynced: boolean;
}

export const useRoomStore = defineStore("room", () => {
  const state = reactive<RoomState>({
    connectionManager: new ConnectionManager(uuidv4()),
    isConnected: false,
    isOwner: false,
    connectedClients: [],
    roomName: "",
    timesynced: false,
  });

  const setupConnectionManagerListeners = (
    connectionManager: ConnectionManager
  ) => {
    connectionManager.addEventListener(
      "client-joined",
      ({ clientId }) => {
        const idx = state.connectedClients.findIndex(
          (data) => data.id === clientId
        );

        // Add client to connected clients list
        if (idx < 0) {
          const clientData: Client = {
            id: clientId,
            nickname: connectionManager.getClientNickname(clientId)!,
            state: "syncing",
            _prevState: "ready",
            uploadedChunks: 0,
            initialState: true,
          };

          state.connectedClients.push(clientData);
        }
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "client-left",
      ({ clientId }) => {
        // Remove client from the clients list
        const idx = state.connectedClients.findIndex(
          (data) => data.id === clientId
        );
        if (idx >= 0) delete state.connectedClients[idx];
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener("timesyncchanged", (timesynced) => {
      state.timesynced = timesynced;
    });

    connectionManager.addEventListener(
      "clienttimesyncchanged",
      ({ clientId, timesynced }) => {
        const idx = state.connectedClients.findIndex(
          (data) => data.id === clientId
        );
        if (idx >= 0) {
          const clientData = { ...state.connectedClients[idx]! };
          // Timesync is starting
          if (timesynced == false) {
            if (clientData.state !== "syncing") {
              clientData._prevState = clientData.state;
            }
            clientData.state = "syncing";
          }
          // Timesync is done
          else {
            clientData.state = clientData.initialState
              ? "ready"
              : clientData._prevState;
            clientData.initialState = false;
            clientData._prevState = "syncing";
          }
          state.connectedClients[idx] = clientData;
        }
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "audiofilesyncing",
      ({ clients }) => {
        const connectedClientsCopy = [...state.connectedClients];

        // Set all target clients to downloading state
        clients.forEach((clientId) => {
          if (clientId === connectionManager.id) {
            return;
          }

          const idx = connectedClientsCopy.findIndex(
            (data) => data.id === clientId
          );

          if (idx >= 0) {
            const clientData = connectedClientsCopy[idx]!;
            clientData._prevState = clientData.state;
            clientData.state = "uploading";
            clientData.uploadedChunks = 0;
          }
        });

        // Update connected clients state
        state.connectedClients = connectedClientsCopy;
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "clientreceivedaudiochunk",
      (clientId) => {
        if (clientId === connectionManager.id) {
          return;
        }

        // Add to the uploaded chunk counter for the given client
        const idx = state.connectedClients.findIndex(
          (data) => data.id === clientId
        );
        if (idx >= 0) {
          const clientData = { ...state.connectedClients[idx]! };
          clientData.uploadedChunks += 1;
          state.connectedClients[idx] = clientData;
        }
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "clientreceivedaudiofile",
      (clientId) => {
        if (clientId === connectionManager.id) {
          return;
        }

        // Set to loading state
        const idx = state.connectedClients.findIndex(
          (data) => data.id === clientId
        );
        if (idx >= 0) {
          const clientData = { ...state.connectedClients[idx]! };
          clientData._prevState = clientData.state;
          clientData.state = "loading";
          state.connectedClients[idx] = clientData;
        }
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "clientaudiofileloadfail",
      (clientId) => {
        if (clientId === connectionManager.id) {
          return;
        }

        // Set to loading state
        const idx = state.connectedClients.findIndex(
          (data) => data.id === clientId
        );
        if (idx >= 0) {
          const clientData = { ...state.connectedClients[idx]! };
          clientData._prevState = clientData.state;
          clientData.state = "error";
          state.connectedClients[idx] = clientData;
        }
      }
    );

    connectionManager.addEventListener("clientreadytoplay", (clientId) => {
      if (clientId === connectionManager.id) {
        return;
      }

      // Set to ready state
      const idx = state.connectedClients.findIndex(
        (data) => data.id === clientId
      );
      if (idx >= 0) {
        const clientData = { ...state.connectedClients[idx]! };
        clientData._prevState = clientData.state;
        clientData.state = "ready";
        state.connectedClients[idx] = clientData;
      }
    });

    connectionManager.addEventListener(
      "room-created",
      () => {
        // Add self
        state.connectedClients = [];
        state.isOwner = connectionManager.isOwner;
        state.roomName = connectionManager.room ?? "";
        state.timesynced = false;
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "room-joined",
      ({ clientIds }) => {
        // TODO: is this right?
        const clients = clientIds.map((clientId) => {
          const clientData: Client = {
            id: clientId,
            nickname: connectionManager.getClientNickname(clientId)!,
            state: "syncing",
            _prevState: "ready",
            uploadedChunks: 0,
            initialState: true,
          };
          return clientData;
        });

        // Add other already connected clients + self
        state.connectedClients = [...clients];
        state.isOwner = connectionManager.isOwner;
        state.roomName = connectionManager.room ?? "";
        state.timesynced = false;
        // Vue.set(state, "connectedClients", [...clients]);
        // Vue.set(state, "isOwner", connectionManager.isOwner);
        // Vue.set(state, "roomName", connectionManager.room);
        // Vue.set(state, "timesynced", false);
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "room-left",
      () => {
        // Reset state
        state.connectedClients = [];
        state.isOwner = false;
        state.roomName = "";
        state.timesynced = false;
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "isconnectedchanged",
      (newIsConnected) => {
        state.isConnected = newIsConnected;
      },
      ROOM_STORE_TAG
    );

    connectionManager.addEventListener(
      "timesyncchanged",
      (timesynced) => {
        state.timesynced = timesynced;
      },
      ROOM_STORE_TAG
    );
  };

  // TODO: why is this giving a type error and why is it expanding the type?
  setupConnectionManagerListeners(state.connectionManager as ConnectionManager);

  const isConnected = computed(() => state.isConnected);
  const isOwner = computed(() => state.isOwner);
  const connectedClients = computed(() => state.connectedClients);
  const id = computed(() => state.connectionManager.id);
  const connectionManager = computed(() => state.connectionManager);
  const roomName = computed(() => state.roomName);
  const timesynced = computed(() => state.timesynced);

  return {
    state,
    isConnected,
    isOwner,
    connectedClients,
    id,
    connectionManager,
    roomName,
    timesynced,
  };
});

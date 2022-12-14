import Emittable from "@/events/Emittable";
import KEYS from "@/keys";
import * as Peer from "peerjs";
import axios from "axios";
import type { AxiosResponse } from "axios";
import * as Timesync from "timesync";
import {
  NICKNAME_STORAGE_KEY,
  TIMESYNC_DELAY,
  TIMESYNC_REPEAT,
  TIMESYNC_TIMEOUT,
  AUDIO_CHUNK_SIZE,
} from "../constants";

// TODO: refactor this
// - Avoid all those case statements
// - Swap off of Axios to something else (maybe fetch)

axios.defaults.withCredentials = true;

// --- Audio-Related Types ---

export interface AudioFileMetadata {
  name: string;
  size: number;
  type: string;
}

interface PlaySignalData {
  startLocation: number;
  startTime: number;
  instant: boolean;
}

interface SyncingData {
  audioFile: Blob;
  clients: string[];
  syncSelf: boolean;
}

export interface MessageData {
  type:
    | "timesync"
    | "audiometadatareceived"
    | "audiochunkreceived"
    | "audiofilereceived"
    | "audiofileloadfailed"
    | "readytoplay"
    | "play"
    | "pause"
    | "stop"
    | "audiometadata"
    | "audiochunk"
    | "closeconnection"
    | "kicked"
    | "clienttimesyncchanged"
    | "runtimesync";
  data: any;
}

// --- Room-Related Types ---

interface CreateRoomData {
  roomName: string;
  selfId: string;
}

interface GetRoomResponse {
  ownerId: string;
}

export interface RoomData {
  roomName: string;
  ownerId: string;
}

export interface RoomJoinedData extends RoomData {
  clientIds: string[];
}

interface ClientData {
  clientId: string;
  nickname: string;
  connection: Peer.DataConnection;
  timesynced: boolean;
}

interface PeerMetadata {
  nickname: string;
}

interface PeerConnections {
  [clientId: string]: ClientData;
}

// --- Event Map ---

interface ConnectionManagerEventMap {
  "room-joined": RoomJoinedData;
  "room-created": RoomData;
  "room-left": RoomData;

  "client-joined": Omit<ClientData, "connection">;
  "client-left": Omit<ClientData, "connection">;

  "room-not-exists": string;
  "room-already-exists": string;

  "not-in-room": null;
  "already-in-room": string;

  isconnectedchanged: boolean;
  timesyncchanged: boolean;
  timesyncsent: null;

  error: any;

  audiometadatasent: AudioFileMetadata;
  audiochunksent: ArrayBuffer;
  audiofilesent: Blob;
  audiofilesyncing: SyncingData;

  audiometadatareceived: AudioFileMetadata;
  audiochunkreceived: ArrayBuffer;
  audiofilereceived: Blob;
  audiofileloadfailed: null;

  playsignalreceived: PlaySignalData;
  pausesignalreceived: number;
  stopsignalreceived: number;

  clientreceivedaudiometadata: string;
  clientreceivedaudiofile: string;
  clientaudiofileloadfail: string;
  clientreceivedaudiochunk: string;
  clientreadytoplay: string;
  clienttimesyncchanged: Omit<ClientData, "connection">;
}

// The client on the other end starts syncing clocks first
const INITIATOR_TIMESYNC_DELAY = 1000;
const OTHER_TIMESYNC_DELAY = 500;

export default class ConnectionManager extends Emittable {
  private _id: string;
  private _nickname: string;
  private _peer: Peer.Peer;
  private _peerConnections: PeerConnections;

  private _roomName: string | null;
  private _roomOwner: string | null;

  private _timesync: Timesync;

  private _expectedAudioFileSize: number | null;
  private _receivedChunks: ArrayBuffer[];
  private _receivedSize: number;

  private _timesynced: boolean;
  private _timesyncingClientIds: Set<string>;

  constructor(id: string) {
    super();

    const options: Peer.PeerJSOption = {
      host: KEYS.PEERJS_HOST,
      path: KEYS.PEERJS_PATH,
      port: KEYS.PEERJS_PORT,
      secure: KEYS.PEERJS_SECURE,
      config: {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      },
    };

    const peer = new Peer.Peer(id, options);
    this._peer = peer;

    this._id = peer.id;

    // Attempt to load nickname
    const storedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
    this._nickname = storedNickname?.trim() ? storedNickname : this._id;

    this._peerConnections = {};

    this._roomName = null;
    this._roomOwner = null;

    this._expectedAudioFileSize = null;
    this._receivedChunks = [];
    this._receivedSize = 0;

    this._timesynced = false;

    this._timesync = this.createTimesyncInstance([]);
    this._timesyncingClientIds = new Set();

    this.setupPeerListeners(peer);

    window.addEventListener("beforeunload", () => {
      // Leave the room
      this.leaveRoom();
    });
  }

  private createTimesyncInstance(peers: string[]): Timesync {
    const timesync = Timesync.create({
      peers: [...peers],
      interval: null, // Disable automatic synchronization
      delay: TIMESYNC_DELAY,
      repeat: TIMESYNC_REPEAT,
      timeout: TIMESYNC_TIMEOUT,
    });

    this.setupTimesync(timesync);

    return timesync;
  }

  private setupPeerListeners(peer: Peer.Peer) {
    // When a remote peer connects with us
    peer.on("connection", (conn) => {
      // When the data connection is ready to be used
      conn.on("open", () => {
        const clientData = this.addPeerConnection(conn);
        const clientId = clientData.clientId;

        if (this.isOwner) {
          this.emitEvent("client-joined", clientData);
        }

        // Add peer to peer list
        const timesync = this._timesync;
        const peerList = timesync.options.peers as string[];
        if (!peerList.includes(clientId)) {
          peerList.push(clientId);
        }
        timesync.options.peers = peerList;

        // Run the sync process
        setTimeout(() => {
          timesync.sync();
        }, INITIATOR_TIMESYNC_DELAY);

        // Setup close connection handler
        conn.on("close", () => {
          // If the client is still marked as in the room (ie connection was not closed by us)
          // then disconnect it now
          if (this._peerConnections[clientId]) {
            // Handle if the client was timesyncing at it left prematurely
            const deleted = this._timesyncingClientIds.delete(clientId);
            if (this._timesyncingClientIds.size === 0 && deleted) {
              this._timesynced = true;
              this.emitEvent("timesyncchanged", true);
            }

            this.emitEvent("client-left", clientData);
          }
        });
      });
    });
  }

  private setupTimesync(timesync: Timesync) {
    // Override send function to hook up with our data channel as the transport
    timesync.send = (to, data, timeout): Promise<void> => {
      return new Promise((resolve, reject) => {
        const sendChannel = this._peerConnections[to]!.connection;
        if (!sendChannel) {
          return reject();
        }

        const messageData: MessageData = {
          type: "timesync",
          data: data,
        };

        let intervalId: number | null = null;
        if (timeout) {
          intervalId = setInterval(() => {
            reject();
          }, timeout);
        }

        try {
          sendChannel.send(messageData);

          this.emitEvent("timesyncsent", null);

          if (intervalId) clearInterval(intervalId);
          resolve();
        } catch (err) {
          if (intervalId) clearInterval(intervalId);
          reject();
        }
      });
    };

    timesync.on("sync", (state) => {
      if (!this.isConnected) return;

      if (state === "start") {
        this._timesynced = false;
        this.emitEvent("timesyncchanged", false);
      } else if (state === "end") {
        this._timesynced = true;
        this.emitEvent("timesyncchanged", true);
      }

      if (!this.isOwner) {
        // Send message to host client indicating that we are synced
        const messageData: MessageData = {
          type: "clienttimesyncchanged",
          data: state == "start" ? false : true, // Timesyncing flag
        };

        Object.values(this._peerConnections).forEach((clientData) => {
          const connection = clientData.connection;

          // Send close warning signal to other client
          connection.send(messageData);
        });
      }
    });
  }

  private addPeerConnection(conn: Peer.DataConnection): ClientData {
    const clientId = conn.peer;

    const peerMetadata = conn.metadata as PeerMetadata;

    // Add the peer
    const clientData: ClientData = {
      clientId,
      nickname: peerMetadata.nickname,
      connection: conn,
      timesynced: false,
    };
    this._peerConnections[clientId] = clientData;

    this.setupPeerConnectionListeners(clientId, conn);

    return clientData;
  }

  private setupPeerConnectionListeners(
    clientId: string,
    conn: Peer.DataConnection
  ) {
    conn.on("data", (rawData) => {
      if (!this.isConnected) return;

      const messageData = rawData as MessageData;

      switch (messageData.type) {
        case "audiometadata": {
          try {
            const metadata = messageData.data as AudioFileMetadata;

            // Initialize accumulator data
            this._expectedAudioFileSize = metadata.size;
            this._receivedChunks = [];
            this._receivedSize = 0;

            this.emitEvent("audiometadatareceived", metadata);

            this.sendAudioMetadataReceivedSignal(this.id!, clientId);
          } catch (err) {
            this.emitEvent("error", "Malformed audio metadata object");
          }

          break;
        }
        case "audiochunk": {
          const arrBuff = messageData.data as ArrayBuffer;

          // Add to the list of accumulated chunks for the audio file being received
          this._receivedChunks.push(arrBuff);
          this._receivedSize += arrBuff.byteLength;

          this.emitEvent("audiochunkreceived", arrBuff);

          this.sendAudioChunkReceivedSignal(this.id!, clientId);

          if (!this._expectedAudioFileSize) return;

          // If we have loaded the entire file
          if (this._receivedSize >= this._expectedAudioFileSize) {
            // Create the audio file blob and fire the event
            const dataBlob = new Blob(this._receivedChunks);

            // Clear accumulator data
            this._expectedAudioFileSize = null;
            this._receivedChunks = [];
            this._receivedSize = 0;

            this.emitEvent("audiofilereceived", dataBlob);

            this.sendAudioFileReceivedSignal(this.id!, clientId);
          }

          break;
        }
        case "play": {
          const playSignalData = messageData.data as PlaySignalData;
          this.emitEvent("playsignalreceived", playSignalData);
          break;
        }
        case "pause": {
          const pauseSentTime = messageData.data as number;
          this.emitEvent("pausesignalreceived", pauseSentTime);
          break;
        }
        case "stop": {
          const stopSentTime = messageData.data as number;
          this.emitEvent("stopsignalreceived", stopSentTime);
          break;
        }
        case "audiofilereceived": {
          const afrReceivedClientId = messageData.data as string;
          this.emitEvent("clientreceivedaudiofile", afrReceivedClientId);
          break;
        }
        case "audiofileloadfailed": {
          const aflfReceivedClientId = messageData.data as string;
          this.emitEvent("clientaudiofileloadfail", aflfReceivedClientId);
          break;
        }
        case "audiochunkreceived": {
          const acrReceivedClientId = messageData.data as string;
          this.emitEvent("clientreceivedaudiochunk", acrReceivedClientId);
          break;
        }
        case "audiometadatareceived": {
          const amdrReceivedClientId = messageData.data as string;
          this.emitEvent("clientreceivedaudiometadata", amdrReceivedClientId);
          break;
        }
        case "readytoplay": {
          const rtpReceivedClientId = messageData.data as string;
          this.emitEvent("clientreadytoplay", rtpReceivedClientId);
          break;
        }
        case "closeconnection": {
          const leavingClientID = messageData.data as string;
          const connection = this._peerConnections[leavingClientID]?.connection;

          if (connection) {
            connection.close();
          }

          if (!this.isOwner) {
            const data: RoomData = {
              ownerId: this._roomOwner!,
              roomName: this._roomName!,
            };

            this._roomName = null;
            this._roomOwner = null;

            // Clear peer connections table
            this._peerConnections = {};

            // Clear timesync peer list
            this._timesync.options.peers = [];

            this.emitEvent("room-left", data);

            this.emitEvent("isconnectedchanged", false);
          } else {
            const clientId = conn.peer;

            const clientData: ClientData = {
              ...this._peerConnections[clientId]!,
            };

            // Remove the peer from the peer connections map
            delete this._peerConnections[clientId];

            // Remove peer from timesync peer list
            const timesync = this._timesync;
            const peerList = timesync.options.peers as string[];
            const peerIdx = peerList.indexOf(clientData.clientId);
            if (peerIdx > -1) {
              peerList.splice(peerIdx, 1);
            }
            timesync.options.peers = peerList;

            // Handle if the client was timesyncing at it left prematurely
            const deleted = this._timesyncingClientIds.delete(
              clientData.clientId
            );
            if (this._timesyncingClientIds.size === 0 && deleted) {
              this._timesynced = true;
              this.emitEvent("timesyncchanged", true);
            }

            this.emitEvent("client-left", clientData);
          }

          break;
        }
        case "kicked": {
          this.leaveRoom();

          break;
        }
        case "clienttimesyncchanged": {
          const timesynced = messageData.data as boolean;

          // Update the client state
          this._peerConnections[clientId]!.timesynced = timesynced;

          if (timesynced === true) {
            // Remove the client from the set of timesyncing clients, if it exists
            this._timesyncingClientIds.delete(clientId);
          } else {
            // Add the client to the set of time syncing clients
            this._timesyncingClientIds.add(clientId);
          }

          this.emitEvent("clienttimesyncchanged", {
            ...this._peerConnections[clientId]!,
          });
          break;
        }
        case "runtimesync": {
          this._timesync.sync();
          break;
        }
        case "timesync": {
          // Notify timesync that sync data has been sent to it
          this._timesync.receive(clientId, messageData.data);
          break;
        }
      }
    });
  }

  // ----------------------
  // --- Public Methods ---
  // ----------------------

  /**
   * Attempts to crete a room
   *
   * @param room The room name
   */
  async createRoom(roomName: string) {
    if (this.isConnected) {
      this.emitEvent("already-in-room", this._roomName!);
      return;
    }

    // Clear audio chunk related data
    this._expectedAudioFileSize = null;
    this._receivedChunks = [];
    this._receivedSize = 0;

    // Reinitialize timesync instance
    this._timesync.destroy();
    this._timesync = this.createTimesyncInstance([]);

    const data: CreateRoomData = {
      roomName,
      selfId: this._peer.id,
    };

    try {
      const res = await axios.post(
        `${KEYS.ROOM_SERVER_URL}/rooms/create`,
        data
      );

      if (res.status === 200) {
        const data: RoomData = {
          ownerId: this._id,
          roomName: roomName,
        };

        this._roomName = roomName;
        this._roomOwner = this._id;

        this.emitEvent("isconnectedchanged", true);

        this.emitEvent("room-created", data);
      } else if (res.status == 409) {
        this.emitEvent("room-already-exists", roomName);
      } else {
        throw `Unsupported status code: ${res.status}`;
      }
    } catch (err: any) {
      const response = err?.response as AxiosResponse | undefined;

      if (response) {
        if (response.status === 409) {
          this.emitEvent("room-already-exists", roomName);
        } else if (response.status === 500) {
          this.emitEvent("error", "Error when creating room");
        } else {
          this.emitEvent(
            "error",
            `Unsupported status code: ${response.status}`
          );
        }
      } else {
        this.emitEvent("error", err);
      }
    }
  }

  /**
   * Attempts to join a room
   *
   * @param room The room name
   */
  async joinRoom(roomName: string) {
    if (this.isConnected) {
      this.emitEvent("already-in-room", this._roomName!);
      return;
    }

    // Clear audio chunk related data
    this._expectedAudioFileSize = null;
    this._receivedChunks = [];
    this._receivedSize = 0;

    try {
      const res = await axios.get<GetRoomResponse>(
        `${KEYS.ROOM_SERVER_URL}/rooms/${roomName}`
      );

      if (res.status === 200) {
        const ownerId = res.data.ownerId;

        const data: RoomJoinedData = {
          ownerId,
          roomName,
          clientIds: Object.keys(this._peerConnections),
        };

        const peer = this._peer;

        // Connect to the room owner

        const peerMetadata: PeerMetadata = {
          nickname: this._nickname,
        };

        const conn = peer.connect(ownerId, {
          metadata: peerMetadata,
          reliable: true,
        });

        conn.on("open", () => {
          this.addPeerConnection(conn);

          this._roomName = roomName;
          this._roomOwner = ownerId;

          // Add peer to peer list
          const peerList = [...(this._timesync.options.peers as string[])];
          if (!peerList.includes(ownerId)) {
            peerList.push(ownerId);
          }

          // Reinitialize timesync instance
          this._timesync.destroy();
          this._timesync = this.createTimesyncInstance(peerList);

          // Run the sync process
          setTimeout(() => {
            this._timesync.sync();
          }, OTHER_TIMESYNC_DELAY);

          this.emitEvent("isconnectedchanged", true);

          this.emitEvent("room-joined", data);
        });

        conn.on("error", (err) => {
          this.emitEvent("error", err);
        });
      } else {
        throw `Unsupported status code: ${res.status}`;
      }
    } catch (err: any) {
      const response = err?.response as AxiosResponse | undefined;

      if (response) {
        if (response.status === 404) {
          this.emitEvent("room-not-exists", roomName);
        } else if (response.status === 500) {
          this.emitEvent("error", "Error when joining room");
        } else {
          this.emitEvent(
            "error",
            `Unsupported status code: ${response.status}`
          );
        }
      } else {
        this.emitEvent("error", err);
      }
    }
  }

  /**
   * Leaves the current room, if in one
   */
  async leaveRoom() {
    if (!this.isConnected) {
      this.emitEvent("not-in-room", null);
      return;
    }

    // Close all peer connections
    const messageData: MessageData = {
      type: "closeconnection",
      data: this._id,
    };
    Object.values(this._peerConnections).forEach((clientData) => {
      const connection = clientData.connection;

      // Send close warning signal to other client
      connection.send(messageData);
    });

    // Clear peer connections table
    this._peerConnections = {};

    // Clear timesync peer list
    this._timesync.options.peers = [];

    // Clear audio chunk related data
    this._expectedAudioFileSize = null;
    this._receivedChunks = [];
    this._receivedSize = 0;

    if (this.isOwner) {
      // Attempt to delete the room on the server
      try {
        await axios.delete(`${KEYS.ROOM_SERVER_URL}/rooms/${this._roomName!}`);
      } catch (err) {
        this.emitEvent("error", `Unable to delete room ${this._roomName}`);
      }
    }

    const data: RoomData = {
      ownerId: this._roomOwner!,
      roomName: this._roomName!,
    };

    this._roomName = null;
    this._roomOwner = null;

    this.emitEvent("isconnectedchanged", false);
    this.emitEvent("room-left", data);
  }

  /**
   * Attempts to kick the given client
   *
   * @param clientId The id of the client to kick
   */
  kickClient(clientId: string) {
    if (!this.isConnected) {
      this.emitEvent("not-in-room", null);
      return;
    }

    if (!this.isOwner) {
      this.emitEvent("error", "Unable to kick client: must be owner");
      return;
    }

    const clientData = this._peerConnections[clientId];

    if (!clientData) {
      this.emitEvent("error", "Unable to kick client: client not found");
      return;
    }

    // Send kick signal to the client
    const messageData: MessageData = {
      type: "kicked",
      data: this._id,
    };

    const connection = clientData.connection;
    connection.send(messageData);
  }

  /**
   * Syncs the audio given audio file to all connected clients
   *
   * @param audioFile The audio file blob.
   * @param metadata The metadata for the audio file.
   * @param syncSelf Sync the audio file to self as well (i.e. the audio file was changed and we want to update our own version)
   * @param clients The target clients to sync the audio file to. If not given then all clients are synced.
   */
  syncAudioFile(
    audioFile: Blob,
    metadata: AudioFileMetadata,
    syncSelf = true,
    clients?: string[]
  ) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return;
    }

    if (!this.isOwner) {
      this.emitEvent("error", "Unable to sync audio file: not room owner");
      return -1;
    }

    if (audioFile.size === 0) {
      this.emitEvent("error", "Cannot send empty file");
      return;
    }

    const targetClients = clients ? clients : this.clientIds;

    const data: SyncingData = {
      audioFile: audioFile,
      clients: targetClients,
      syncSelf,
    };

    this.emitEvent("audiofilesyncing", data);

    // Send metadata to each client
    targetClients.forEach((clientId) => {
      const messageData: MessageData = {
        type: "audiometadata",
        data: metadata,
      };

      const sendChannel = this._peerConnections[clientId]!.connection;
      sendChannel.send(messageData);
    });

    this.emitEvent("audiometadatasent", metadata);

    // --- Send the file ---
    const fileReader = new FileReader();
    let currOffset = 0;

    function readSlice(offset: number) {
      const slice = audioFile.slice(currOffset, offset + AUDIO_CHUNK_SIZE);
      fileReader.readAsArrayBuffer(slice);
    }

    fileReader.addEventListener("load", (event) => {
      const chunk = event.target?.result as ArrayBuffer;

      const messageData: MessageData = {
        type: "audiochunk",
        data: chunk,
      };

      // Send chunk to each client
      targetClients.forEach((clientId) => {
        const sendChannel = this._peerConnections[clientId]?.connection;
        if (sendChannel) {
          sendChannel.send(messageData);
        }
      });

      currOffset += chunk.byteLength;

      this.emitEvent("audiochunksent", chunk);

      // If we still have more file to send, read the next chunk
      if (currOffset < audioFile.size && this.isConnected) {
        readSlice(currOffset);
      } else {
        // The entire file is sent
        this.emitEvent("audiofilesent", audioFile);
      }
    });

    // Begin reading the audio file
    readSlice(0);
  }

  /**
   * Sends the play signal to the clients
   *
   * @param startLocation The location in the song to start at
   * @param delay How far in the future the start time signal should be set (in milliseconds)
   * @param localOnly Send the play signal locally only
   * @param instant Play instantly, ignoring any syncing precautions
   * @param sendSelf Send the signal to self (only want this as false if the audio is already playing and we want to tell another client to start playing)
   * @param clients The target clients to send the signal to. If not given then all clients are sent the signal.
   *
   * @return Returns the start timestamp
   */
  sendPlaySignal(
    startLocation: number,
    delay = 100,
    localOnly = false,
    instant = false,
    sendSelf = true,
    clients?: string[]
  ): number {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return -1;
    }

    if (!this.isOwner && !localOnly) {
      this.emitEvent("error", "Unable to send play signal: not room owner");
      return -1;
    }

    const timesync = this._timesync;
    const now = timesync.now();
    const startTime = now + delay;

    const data: PlaySignalData = {
      startLocation,
      startTime,
      instant,
    };

    if (!localOnly) {
      const messageData: MessageData = {
        type: "play",
        data,
      };

      const targetClients = clients ? clients : this.clientIds;

      targetClients.forEach((clientId) => {
        if (clientId === this._id) return;

        const sendChannel = this._peerConnections[clientId]!.connection;
        sendChannel.send(messageData);
      });
    }

    if (sendSelf) {
      // Send play signal to self
      this.emitEvent("playsignalreceived", data);
    }

    return startTime;
  }

  /**
   * Sends the pause signal to all connected clients
   * @param sendSelf Send the signal to self.
   * @param clients The target clients to send the signal to. If not given then all clients are sent the signal.
   */
  sendPauseSignal(sendSelf = true, clients?: string[]) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return -1;
    }

    if (!this.isOwner) {
      this.emitEvent("error", "Unable to send pause signal: not room owner");
      return -1;
    }

    const now = this._timesync.now();

    const messageData: MessageData = {
      type: "pause",
      data: now,
    };

    const targetClients = clients ? clients : this.clientIds;
    targetClients.forEach((clientId) => {
      if (clientId === this._id) return;

      const sendChannel = this._peerConnections[clientId]!.connection;
      sendChannel.send(messageData);
    });

    if (sendSelf) {
      // Send pause signal to self
      this.emitEvent("pausesignalreceived", now);
    }
  }

  /**
   * Sends the stop signal to all connected clients
   * @param sendSelf Send the signal to self.
   * @param clients The target clients to send the signal to. If not given then all clients are sent the signal.
   */
  sendStopSignal(sendSelf = true, clients?: string[]) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return -1;
    }

    if (!this.isOwner) {
      this.emitEvent("error", "Unable to send stop signal: not room owner");
      return -1;
    }

    const now = this._timesync.now();

    const messageData: MessageData = {
      type: "stop",
      data: now,
    };

    const targetClients = clients ? clients : this.clientIds;
    targetClients.forEach((clientId) => {
      if (clientId === this._id) return;

      const sendChannel = this._peerConnections[clientId]!.connection;
      sendChannel.send(messageData);
    });

    if (sendSelf) {
      // Send stop signal to self
      this.emitEvent("stopsignalreceived", now);
    }
  }

  /**
   * Sends the audiometadatareceived signal to the given client id
   *
   * @param selfId The id of self
   * @param toId The id of the client to send the signal to
   */
  protected sendAudioMetadataReceivedSignal(selfId: string, toId: string) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return;
    }

    if (this.isOwner) {
      this.emitEvent(
        "error",
        "Unable to send audio metadata received signal: not a client"
      );
      return;
    }

    const sendChannel = this._peerConnections[toId]!.connection;

    if (!sendChannel) {
      this.emitEvent(
        "error",
        `Unable to send audio metadata received signal to ${toId}`
      );
      return;
    }

    const messageData: MessageData = {
      type: "audiometadatareceived",
      data: selfId,
    };

    sendChannel.send(messageData);
  }

  /**
   * Sends the audiochunkreceived signal to the given client id
   *
   * @param selfId The id of self
   * @param toId The id of the client to send the signal to
   */
  protected sendAudioChunkReceivedSignal(selfId: string, toId: string) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return;
    }

    if (this.isOwner) {
      this.emitEvent(
        "error",
        "Unable to send audio chunk received signal: not a client"
      );
      return;
    }

    const sendChannel = this._peerConnections[toId]!.connection;

    if (!sendChannel) {
      this.emitEvent(
        "error",
        `Unable to send audio chunk received signal to ${toId}`
      );
      return;
    }

    const messageData: MessageData = {
      type: "audiochunkreceived",
      data: selfId,
    };

    sendChannel.send(messageData);
  }

  /**
   * Sends the audiofilereceived signal to the given client id
   *
   * @param selfId The id of self
   * @param toId The id of the client to send the signal to
   */
  protected sendAudioFileReceivedSignal(selfId: string, toId: string) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return;
    }

    if (this.isOwner) {
      this.emitEvent(
        "error",
        "Unable to send audio file received signal: not a client"
      );
      return;
    }

    const sendChannel = this._peerConnections[toId]!.connection;

    if (!sendChannel) {
      this.emitEvent(
        "error",
        `Unable to send audio file received signal to ${toId}`
      );
      return;
    }

    const messageData: MessageData = {
      type: "audiofilereceived",
      data: selfId,
    };

    sendChannel.send(messageData);
  }

  /**
   * Sends the readytoplay signal to all RTC connections
   *
   * @param selfId The id of self
   */
  sendReadyToPlaySignal(selfId: string) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return;
    }

    if (this.isOwner) {
      this.emitEvent(
        "error",
        "Unable to send ready to play signal: not a client"
      );
      return;
    }

    this.clientIds.forEach((otherId) => {
      const syncSendChannel = this._peerConnections[otherId]!.connection;

      if (!syncSendChannel) {
        this.emitEvent(
          "error",
          `Unable to send ready to play signal to ${otherId}`
        );
        return;
      }

      const messageData: MessageData = {
        type: "readytoplay",
        data: selfId,
      };

      syncSendChannel.send(messageData);
    });
  }

  /**
   * Sends a signal back to the room owner that the audio file was unable to be loaded
   *
   * @param selfId The id of self
   */
  sendAudioFileLoadFailedSignal(selfId: string) {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return;
    }

    if (this.isOwner) {
      this.emitEvent(
        "error",
        "Unable to send ready to play signal: not a client"
      );
      return;
    }

    this.clientIds.forEach((otherId) => {
      const syncSendChannel = this._peerConnections[otherId]!.connection;

      if (!syncSendChannel) {
        this.emitEvent(
          "error",
          `Unable to send ready to play signal to ${otherId}`
        );
        return;
      }

      const messageData: MessageData = {
        type: "audiofileloadfailed",
        data: selfId,
      };

      syncSendChannel.send(messageData);
    });
  }

  /**
   * Runs clock synchronization.
   */
  synchronizeClocks() {
    if (!this.isConnected) {
      this.emitEvent("error", "Not connected to a room");
      return -1;
    }

    if (!this.isOwner) {
      this.emitEvent("error", "Unable to synchronize clocks: not room owner");
      return;
    }

    const targetClients = this.clientIds;

    const peers = [...(this._timesync.options.peers as string[])];
    this._timesync.destroy();
    this._timesync = this.createTimesyncInstance(peers);

    // Delay by a little bit so we don't run into problems with the clients syncing
    setTimeout(() => {
      // this._timesynced = false;
      // this.emitEvent("timesyncchanged", false);

      this._timesync.sync();
    }, 100);

    const messageData: MessageData = {
      type: "runtimesync",
      data: null,
    };

    targetClients.forEach((clientId) => {
      const clientData = this._peerConnections[clientId]!;

      clientData.timesynced = false;

      clientData.connection.send(messageData);

      this.emitEvent("clienttimesyncchanged", { ...clientData });
    });
  }

  /**
   * Gives the current synced time.
   */
  now(): number {
    return this._timesync.now();
  }

  /**
   * Gets the nickname of a client (including self, if given).
   *
   * @param clientId The id of the client.
   */
  getClientNickname(clientId: string): string | null {
    if (clientId == this._id) {
      return this._nickname;
    }

    const clientData = this._peerConnections[clientId];
    return clientData ? clientData.nickname : null;
  }

  /**
   * Update the nickname of self.
   *
   * @param newNickname The new nickname.
   */
  setNickname(newNickname: string) {
    this._nickname = newNickname;
  }

  // ---------------
  // --- Getters ---
  // ---------------

  get id(): string {
    return this._id;
  }

  get nickname(): string {
    return this._nickname;
  }

  get isOwner(): boolean {
    return this._id === this._roomOwner;
  }

  get isConnected(): boolean {
    return !!this._roomName;
  }

  get room(): string | null {
    return this._roomName;
  }

  get roomOwner(): string | null {
    return this._roomOwner;
  }

  get clientIds(): string[] {
    return Object.keys(this._peerConnections);
  }

  get timesynced(): boolean {
    return this._timesynced;
  }

  get hasClients(): boolean {
    return Object.keys(this._peerConnections).length > 0;
  }

  // -------------------------------------
  // --- EventEmitter Method Overrides ---
  // -------------------------------------

  protected emitEvent<K extends keyof ConnectionManagerEventMap>(
    eventName: K,
    event: ConnectionManagerEventMap[K]
  ) {
    super.emitEvent(eventName, event);
  }

  addEventListener<K extends keyof ConnectionManagerEventMap>(
    eventName: K,
    listener: (event: ConnectionManagerEventMap[K]) => any,
    tag?: string
  ) {
    super.addEventListener(eventName, listener, tag);
  }

  removeEventListener<K extends keyof ConnectionManagerEventMap>(
    eventName: K,
    listener: (event: ConnectionManagerEventMap[K]) => any
  ) {
    super.removeEventListener(eventName, listener);
  }

  removeEventListenersByTag<K extends keyof ConnectionManagerEventMap>(
    eventName: K,
    tag: string
  ) {
    super.removeEventListenersByTag(eventName, tag);
  }
}

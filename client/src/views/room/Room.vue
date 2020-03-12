<template>
    <div id="Room">
        <button
            @click="leaveRoom"
            :disabled="!isConnected"
        >
            Leave Room
        </button>

        <div>
            <div>RoomManager connected: {{ isConnected }}</div>

            <div>
                Signalling Server Clients:
                <ul>
                    <li 
                        :key="`signalling-client-${clientId}`"
                        v-for="clientId in connectedSocketClients"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>
            <br>
            <div>
                WebRTC Connections:
                <ul>
                    <li 
                        :key="`rtc-peer-${clientId}`"
                        v-for="(clientId) in connectedRTCClients"
                    >
                        {{ clientId }}
                    </li>
                </ul>
            </div>

            <div>
                <button
                    @click="sayHi"
                >
                    Say Hi!
                </button>
                <input 
                    type="text" 
                    placeholder="Send to..." 
                    v-model="sendClientId"
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters, mapActions } from "vuex";
import { Getters, MapGettersStructure, Actions, MapActionsStructure } from "../../store/modules/room";
import PeerManager from '../../rtc/PeerManager';
import SignallingSocket from '../../socket/SignallingSocket';
import RoomManager from '../../rtc/RoomManager';
import VueRouter from 'vue-router';

interface Data {
    // signallingClientIds: string[];
    sendClientId: string;
    // rtcPeers: string[];

    connectedSocketClients: string[];
    connectedRTCClients: string[];
}

type Computed = Pick<MapGettersStructure, Getters.roomManager | Getters.isConnected> & {}

type Methods = Pick<MapActionsStructure, Actions.deleteRoomManager> & {
    leaveRoom(): void;
    sayHi(): void;
    onRoomLeft(): void;
    setupGeneralRTCListeners(peerManager: PeerManager): void;
    setupGeneralSocketListeners(socket: SignallingSocket): void;
}

export default Vue.extend({
    // TODO: add checks for if there is no roomManager
    // TODO: add proper tracking of currently connected clients (probably in room store)
    components: {

    },
    data() {
        return {
            // signallingClientIds: [],
            sendClientId: "",
            // rtcPeers: [],
        }
    },
    computed: {
        ...mapGetters({
            roomManager: Getters.roomManager,
            isConnected: Getters.isConnected,
            connectedSocketClients: Getters.connectedSocketClients,
            connectedRTCClients: Getters.connectedRTCClients,
        })
    },
    mounted() {
        // TODO: actually do something here
        const { isConnected }: Computed = this;
        if (!isConnected) {
            console.log("WARNING: Not connected to a room... you shouldn't be in here");
        } else {
            const { setupGeneralRTCListeners, setupGeneralSocketListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            const signallingSocket = roomManager.signallingSocket as SignallingSocket;

            setupGeneralRTCListeners(peerManager);
            setupGeneralSocketListeners(signallingSocket);
        }
    },
    methods: {
        ...mapActions({
            deleteRoomManager: Actions.deleteRoomManager
        }),
        sayHi() {
            const { sendClientId }: Data = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            peerManager.sendMessage(sendClientId.trim(), "Hello from the other side!");
        },
        leaveRoom() {
            const roomManager = this.roomManager as RoomManager;
            roomManager.leaveRoom();
        },
        onRoomLeft() {
            const { deleteRoomManager }: Methods = this;
            const router = this.$router as VueRouter;

            deleteRoomManager();

            // Go back to home page
            router.push('/');
        },
        setupGeneralRTCListeners(peerManager: PeerManager) {
            // Note: this only works for rtc clients that connect while this page is open
            // TODO: fix this
            // const { rtcPeers }: Data = this;
            // peerManager.addEventListener("rtcconnected", ({ clientId, sourceEvent }) => {
            //     // console.log("rtcconnected: ", clientId, sourceEvent);
            //     console.log(`RTC: Client '${clientId}' connected`);
            //     rtcPeers.push(clientId);
            // });

            // peerManager.addEventListener("rtcdisconnected", ({ clientId, sourceEvent }) => {
            //     // console.log("rtcdisconnected: ", clientId, sourceEvent);
            //     console.log(`RTC: Client '${clientId}' disconnected`);
                
            //     const idx = rtcPeers.indexOf(clientId);
            //     if (idx >= 0) Vue.delete(this.rtcPeers, idx);
            // });

            // peerManager.addEventListener("rtcfailed", ({ clientId, sourceEvent }) => {
            //     // console.log("rtcfailed: ", clientId, sourceEvent);
            // });

            // peerManager.addEventListener("rtcreceivechannelclose", ({ clientId, sourceEvent }) => {
            //     console.log("receivechannelclose: ", clientId, sourceEvent);

            //     const idx = rtcPeers.indexOf(clientId);
            //     if (idx >= 0) Vue.delete(this.rtcPeers, idx);
            // });

            peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
                console.log("rtcreceivechannelmessage: Message from", clientId, sourceEvent.data);
            });
        },
        setupGeneralSocketListeners(socket: SignallingSocket) {
            socket.on("room-left", () => {
                const { onRoomLeft }: Methods = this;
                onRoomLeft();
            });
        }
    }
});
</script>

<style lang="scss" scoped>

</style>
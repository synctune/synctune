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
                        v-for="clientId in signallingClientIds"
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
                        v-for="(clientId) in rtcPeers"
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
import { mapGetters } from "vuex";
import { Getters, MapGettersStructure } from "../../store/modules/room";
import PeerManager from '../../rtc/PeerManager';
import SignallingSocket from '../../socket/SignallingSocket';
import RoomManager from '../../rtc/RoomManager';
import VueRouter from 'vue-router';

interface Data {
    signallingClientIds: string[];
    sendClientId: string;
    rtcPeers: string[];
}

type Computed = Pick<MapGettersStructure, Getters.roomManager | Getters.isConnected> & {}

interface Methods {
    leaveRoom(): void;
    sayHi(): void;
    setupGeneralRTCListeners(peerManager: PeerManager): void;
    // setupGeneralSocketListeners(socket: SignallingSocket): void;
}

export default Vue.extend({
    // TODO: add checks for if there is no roomManager
    // TODO: add proper tracking of currently connected clients (probably in room store)
    components: {

    },
    data() {
        return {
            signallingClientIds: [],
            sendClientId: "",
            rtcPeers: [],
        }
    },
    computed: {
        ...mapGetters({
            roomManager: Getters.roomManager,
            isConnected: Getters.isConnected,
        })
    },
    mounted() {
        // TODO: actually do something here
        const { isConnected }: Computed = this;
        if (!isConnected) {
            console.log("WARNING: Not connected to a room... you shouldn't be in here");
        } else {
            const { setupGeneralRTCListeners }: Methods = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;

            setupGeneralRTCListeners(peerManager);
        }
    },
    methods: {
        sayHi() {
            const { sendClientId }: Data = this;
            const roomManager = this.roomManager as RoomManager;
            const peerManager = roomManager.peerManager as PeerManager;
            peerManager.sendMessage(sendClientId.trim(), "Hello from the other side!");
        },
        leaveRoom() {
            const roomManager = this.roomManager as RoomManager;
            const router = this.$router as VueRouter;

            roomManager.leaveRoom();

            // Go back to home page
            router.push('/');
        },
        setupGeneralRTCListeners(peerManager: PeerManager) {
            // Note: this only works for rtc clients that connect while this page is open
            // TODO: fix this
            const { rtcPeers }: Data = this;
            peerManager.addEventListener("rtcconnected", ({ clientId, sourceEvent }) => {
                console.log(`RTC: Client '${clientId}' connected`);
                rtcPeers.push(clientId);
                this.rtcConnected = true;
            });

            peerManager.addEventListener("rtcdisconnected", ({ clientId, sourceEvent }) => {
                console.log(`RTC: Client '${clientId}' disconnected`);
                
                const idx = rtcPeers.indexOf(clientId);
                if (idx >= 0) Vue.delete(this.rtcPeers, idx);
                this.rtcConnected = false;
            });

            peerManager.addEventListener("rtcreceivechannelmessage", ({ clientId, sourceEvent }) => {
                console.log("Message from", clientId, sourceEvent.data);
            });
        },
    }
});
</script>

<style lang="scss" scoped>

</style>
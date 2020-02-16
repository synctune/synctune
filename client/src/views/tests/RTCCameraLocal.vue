<template>
    <div class="RTCLocalCamera">
        <button @click="connectCamera" :disabled="cameraConnected">Connect Camera</button>
        <button @click="connectRTC" :disabled="streamConnected || !cameraConnected">Stream</button>
        <button @click="disconnectRTC" :disabled="!streamConnected">Disconnect</button>

        <h1>Local Video</h1>
        <video ref="localVideoEl" playsinline autoplay muted></video>

        <h1>Remote Video</h1>
        <video ref="remoteVideoEl" playsinline autoplay></video>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
    localStream: MediaStream;
    localConnection: RTCPeerConnection;
    remoteConnection: RTCPeerConnection;

    cameraConnected: boolean;
    streamConnected: boolean;
}

export default Vue.extend({
    data() {
        return {
            localStream: null,
            localConnection: null,
            remoteConnection: null, 

            // State flags
            cameraConnected: false,
            streamConnected: false
        }
    },
    methods: {
        async connectCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

                if (!stream) return;

                const localVideoEl = this.$refs.localVideoEl as HTMLVideoElement;
                localVideoEl.srcObject = stream;

                this.localStream = stream;

                this.cameraConnected = true;

            } catch(e) {
                console.error(e);

                this.cameraConnected = false;
            }
        },
        async connectRTC() {
            this.localConnection = new RTCPeerConnection();
            this.remoteConnection = new RTCPeerConnection();

            const { 
                localStream, 
                localConnection, 
                remoteConnection }: Data = this;

            // Note: these events are called between the remote and local as they try to
            // figure out the best way to connect
            // It is more than likely that the 'icecandidate' event will fail a couple times
            // as they search for the best way to connect
            // The 'iceconnectstatechange' is called as remote and local switch between different
            // transport modes until they find one that works for both of them

            localConnection.addEventListener('icecandidate', async (event) => {
                try {
                    await remoteConnection.addIceCandidate(event.candidate);

                    console.log("Local: addIceCandidate success");
                } catch(err) {
                    console.log(`Local: Failed to add ICE candidate '${err.toString()}'`);
                }
            });

            remoteConnection.addEventListener('icecandidate', async (event) => {
                try {
                    await localConnection.addIceCandidate(event.candidate);

                    console.log("Remote: addIceCandidate success");
                } catch(err) {
                    console.log(`Remote: Failed to add ICE candidate '${err.toString()}'`);
                }
            });

            localConnection.addEventListener('iceconnectionstatechange', (event) => {
                console.log(`Remote: ICE state: ${localConnection.iceConnectionState}`);
                console.log('ICE state change event: ', event);
            });

            remoteConnection.addEventListener('iceconnectionstatechange', (event) => {
                console.log(`Remote: ICE state: ${remoteConnection.iceConnectionState}`);
                console.log('ICE state change event: ', event);
            });

            remoteConnection.addEventListener('track', (event) => {
                const remoteVideoEl = this.$refs.remoteVideoEl as HTMLVideoElement;

                if (remoteVideoEl.srcObject !== event.streams[0]) {
                    remoteVideoEl.srcObject = event.streams[0];
                    console.log("Remote: received local stream");
                }
            });

            localStream.getTracks().forEach(track => localConnection.addTrack(track, localStream));
            console.log("Local: added local stream");

            // Create the offer on local and set on remote
            try {
                console.log("Local: creating offer...");
                const offer = await localConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true});

                console.log(`Local: Offer from local:\n${offer}`);
                console.log(offer);

                try {
                    await localConnection.setLocalDescription(offer);
                } catch(err) {
                    console.error(`Local: failed to create local description ${err.toString()}`);
                }

                // Note: this is where the offer is sent back up to the signalling server and then given to the remote
                try {
                    await remoteConnection.setRemoteDescription(offer);
                } catch(err) {
                    console.error(`Remote: failed to create remote description ${err.toString()}`);
                }

            } catch(err) {
                console.error(`Local: failed to create session offer: ${err.toString()}`);
                return; // Go no futher
            }

            // Create answer on remote and set on local
            try {
                console.log("Remote: creating answer...");

                const answer = await remoteConnection.createAnswer();

                console.log(`Remote: answer from remote:\n${answer}`);
                console.log(answer);

                try {
                    await remoteConnection.setLocalDescription(answer);
                } catch(err) {
                    console.error(`Remote: failed to create local description ${err.toString()}`);
                }

                // Note: this is where the answer is sent back up to the signalling server and then given to the local
                try {
                    await localConnection.setRemoteDescription(answer);
                } catch(err) {
                    console.error(`Local: failed to create remote description ${err.toString()}`);
                }

            } catch(err) {
                console.error(`Remote: failed to create session answer: ${err.toString()}`);
                return;
            }

            this.streamConnected = true;
        },
        disconnectRTC() {
            const { 
                localConnection, 
                remoteConnection }: Data = this;

            // Close connections
            localConnection.close();
            remoteConnection.close();

            this.localConnection = null;
            this.remoteConnection = null;

            this.streamConnected = false;
        }
    },
    mounted() {
        return;
    }
});
</script>
<template>
    <div class="RTCLocalAudioFile">
        <h1>Audio File Sent Over Local WebRTC</h1>
        <input 
            ref="audioFileEl"
            type="file" 
            name="audio-file"
            @change="addAudioFile"
        >

        <button 
            @click="connectRTC" 
            :disabled="!hasAudioFile || streamConnected"
        >
            Stream
        </button>
        <button 
            @click="disconnectRTC" 
            :disabled="!hasAudioFile || !streamConnected"
        >
            Disconnect
        </button>

        <h2>Local Audio</h2>
        <audio ref="localAudioEl" controls autoplay muted></audio>

        <h2>Remote Audio</h2>
        <audio ref="remoteAudioEl" controls playsinline autoplay></audio>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface Data {
    audioFile: File;

    localConnection: RTCPeerConnection;
    remoteConnection: RTCPeerConnection;

    hasAudioFile: boolean;
    streamConnected: boolean;
}

interface HTMLMediaElementExtended extends HTMLMediaElement {
    captureStream(): MediaStream;
}

export default Vue.extend({
    data() {
        return {
            audioFile: null,

            localConnection: null,
            remoteConnection: null, 

            hasAudioFile: false,
            streamConnected: false,
        }
    },
    methods: {
        addAudioFile() {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const audioFileEl = this.$refs.audioFileEl as HTMLInputElement;

            this.audioFile = audioFileEl.files[0];

            console.log("audioFile", this.audioFile);

            const localAudioEl = this.$refs.localAudioEl as HTMLAudioElement;

            localAudioEl.src = URL.createObjectURL(this.audioFile);
            localAudioEl.load();

            this.hasAudioFile = true;
        },
        async connectRTC() {
            const { audioFile }: Data = this;

            const audioContext = new AudioContext();
            const reader = new FileReader();

            reader.onload = async (e) => {
                const audioArrayBuffer = e.target.result as ArrayBuffer;
                
                // const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);

                // console.log("audioBuffer", audioBuffer);

                this.localConnection = new RTCPeerConnection();
                this.remoteConnection = new RTCPeerConnection();

                const { 
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
                    const remoteAudioEl = this.$refs.remoteAudioEl as HTMLAudioElement;

                    if (remoteAudioEl.srcObject !== event.streams[0]) {
                        remoteAudioEl.srcObject = event.streams[0];
                        console.log("Remote: received local stream");
                        console.log(remoteAudioEl);
                        console.log(event.streams);
                    }
                });

                // localStream.getTracks().forEach(track => localConnection.addTrack(track, localStream));
                const localAudioEl = this.$refs.localAudioEl as HTMLMediaElementExtended;
                const localStream = localAudioEl.captureStream();
                localStream.getTracks().forEach(track => localConnection.addTrack(track, localStream));
                console.log("Local: added local stream");
                console.log(localStream.getTracks());

                // Create the offer on local and set on remote
                try {
                    console.log("Local: creating offer...");
                    const offer = await localConnection.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true});

                    console.log(`Local: Offer from local:\n${offer.sdp}`);
                    // console.log(offer);

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

                    console.log(`Remote: answer from remote:\n${answer.sdp}`);
                    // console.log(answer);

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
            };

            reader.readAsArrayBuffer(audioFile);
        },
        async disconnectRTC() {
            //
        }
    }
});
</script>
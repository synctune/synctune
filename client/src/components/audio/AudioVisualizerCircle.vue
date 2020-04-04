<template>
    <div 
        :class="[
            'AudioVisualizerCircle',
            (disabled) ? 'disabled' : null
        ]"
    >
        <div class="AudioVisualizerCircle__container">
            <!-- TODO: implement visualizer bars in here -->
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

interface Props {
    disabled: boolean;
    audioContext: AudioContext;
}

interface Methods {
    setupAudioContextListener(audioContext: AudioContext): void;
}

export default Vue.extend({
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        audioContext: {
            type: AudioContext,
            default: null // TODO: change to required
        }
    },
    data() {
        return {
            // Note: I haven't looked into setting up this kind of stuff for a while
            // so this "analyzer node" stuff might be coming right out of my...
            // TODO: put analyzer node from the web audio api that is currently
            // being used to display the audio of
        }
    },
    methods: {
        setupAudioContextListener(audioContext: AudioContext) {
            // TODO: implement

            // Disconnect the analyzer node from a previous context (if it exists)
            // Make a new analyzer node to listen to the current audio context
            // Update the data state with the new node
        },
    },
    mounted() {
        const { audioContext }: Props = this;
        const { setupAudioContextListener }: Methods = this;
        setupAudioContextListener(audioContext);
    },
    watch: {
        audioContext(newAudioContext: AudioContext) {
            const { setupAudioContextListener }: Methods = this;
            setupAudioContextListener(newAudioContext);
        }
    }
});
</script>

<style lang="scss" scoped>
    $max-width: 30rem;
    $transition-time: 0.3s;

    .AudioVisualizerCircle {
        width: 100%;
        max-width: $max-width;

        & .AudioVisualizerCircle__container {
            position: relative;

            // For 1:1 aspect-ratio
            width: 100%;
            padding-top: 100%; 

            border-radius: 50%;

            background: color-link("AudioVisualizerCircle", "gradient", "start");
            background: linear-gradient(135deg, color-link("AudioVisualizerCircle", "gradient", "start") 0%, color-link("AudioVisualizerCircle", "gradient", "end") 100%);

            box-shadow: 2px 2px 6px 0px rgba(0, 0, 0, 0.25);

            z-index: 0;

            // For the disabled gradient because gradients do not work with 
            // the transition css property
            &::before {
                content: '';
                border-radius: inherit;
                display: block;

                position: absolute;
                top: 0; 
                left: 0;
                height: 100%;
                width: 100%;

                border-radius: 50%;
                opacity: 0;
                z-index: -1;

                
                background: color-link("AudioVisualizerCircle", "gradient_disabled", "start");
                background: linear-gradient(135deg, color-link("AudioVisualizerCircle", "gradient_disabled", "start") 0%, color-link("AudioVisualizerCircle", "gradient_disabled", "end") 100%);

                transition: opacity $transition-time;
            }
        }

        &.disabled {
            & .AudioVisualizerCircle__container {
                // Show the gradient overlay
                &::before {
                    opacity: 1;
                }
            }
        }
    }
</style>
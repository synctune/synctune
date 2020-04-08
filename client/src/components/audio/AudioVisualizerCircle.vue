<template>
    <div 
        :class="[
            'AudioVisualizerCircle',
            (disabled) ? 'disabled' : null
        ]"
    >
        <div 
            class="AudioVisualizerCircle__container"
            ref="containerEl"
        >
            <!-- TODO: implement visualizer bars in here -->
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import AudioMotionAnalyzer, { Options as AudioMotionOptions } from "audiomotion-analyzer";

interface Data {
    visualizerInstance: AudioMotionAnalyzer | null;
}

interface Props {
    disabled: boolean;
    audioContext: AudioContext;
    audioSource: AudioBufferSourceNode | null;
}

interface Methods {
    createVisualizerInstance(): AudioMotionAnalyzer;
    attachVisualizerInstance(audioSource: AudioBufferSourceNode): void;
    deatchVisualizerInstance(audioSource: AudioBufferSourceNode | null): void;
}

export default Vue.extend({
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        audioContext: {
            type: AudioContext,
            required: true
        },
        audioSource: {
            type: AudioBufferSourceNode,
            default: null
        }
    },
    data() {
        return {
            visualizerInstance: null
        }
    },
    methods: {
        createVisualizerInstance(): AudioMotionAnalyzer {
            const { audioContext, audioSource }: Props = this as any;
            const containerEl = this.$refs.containerEl as HTMLElement;
            
            const radius = 5;

            const instance = new AudioMotionAnalyzer(containerEl, {
                audioCtx: audioContext, 
                mode: 6, // 1/3rd octave bands
                fftSize: 8192,
                smoothing: 0.9,
                barSpace: 0.2,
                minDecibels: -65,
                maxDecibels: -20,
                minFreq: 20,
                maxFreq: 20000,
                reflexRatio: 0.5,
                reflexAlpha: 1,
                reflexFit: true,
                showFPS: false,
                showLeds: false,
                showPeaks: false,
                showScale: false,
                showBgColor: true,
                useAlpha: true,
                rectRadius: {
                    tl: radius,
                    tr: radius, 
                    bl: 0, 
                    br: 0
                }
            });

            instance.registerGradient("synctune", {
                bgColor: "rgba(0, 0, 0, 0)",
                colorStops: [
                    { pos: 0, color: 'rgba(44, 44, 44, 0.6)' }, 
                    { pos: 1, color: 'rgba(44, 44, 44, 0.6)' }
                ]
            });

            

            instance.gradient = "synctune";

            // Make sure the analyzer is never connected to the audio context
            instance.analyzer.disconnect(instance.audioCtx.destination);

            return instance;
        },
        attachVisualizerInstance(audioSource: AudioBufferSourceNode) {
            const { visualizerInstance }: Data = this as any;

            if (!visualizerInstance) {
                return;
            }
            
            const analyzer = visualizerInstance.analyzer;
            const context = visualizerInstance.audioCtx;
            audioSource.connect(analyzer);
            
            // Make sure the analyzer is never connected to the audio context
            try {
                analyzer.disconnect(context.destination);
            } catch(err) {}
        },
        // TODO: this method not needed?
        deatchVisualizerInstance(audioSource: AudioBufferSourceNode | null) {
            const { visualizerInstance }: Data = this as any;

            if (audioSource && visualizerInstance) {
                const analyzer = visualizerInstance.analyzer;
                try {
                    audioSource.disconnect(analyzer);
                } catch(err) {}
            }
        }
    },
    mounted() {
        const { audioSource }: Props = this;
        const { createVisualizerInstance, attachVisualizerInstance }: Methods = this;
        this.visualizerInstance = createVisualizerInstance();

        if (audioSource) {
            attachVisualizerInstance(audioSource);
        }
    },
    beforeDestroy() {
        const { audioSource }: Props = this;
        const { deatchVisualizerInstance }: Methods = this;
        deatchVisualizerInstance(audioSource);
    },
    watch: {
        audioSource(newAudioSource: AudioBufferSourceNode | null) {
            const { attachVisualizerInstance, deatchVisualizerInstance }: Methods = this;

            if (newAudioSource) {
                attachVisualizerInstance(newAudioSource);
            } else {
                deatchVisualizerInstance(newAudioSource);
            }
        }
    }
});
</script>

<style lang="scss">
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

            & canvas {
                position: absolute;
                top: 50%;
                left: 50%;

                transform: translate(-50%, -50%);

                width: 100%;
                height: 60%;

                clip-path: circle(60.5% at 50% 50%);
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
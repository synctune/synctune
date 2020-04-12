export default class HighResolutionTimeout {
    private duration: number;
    private tickDuration: number;
    private callback: (overshoot: number) => unknown;

    private startTime: number | undefined;
    private currentTime: number | undefined;
    private timerId: number | undefined;
    
    constructor(duration: number, callback: (overshoot: number) => unknown) {
        this.duration = duration;
        this.callback = callback;

        this.tickDuration = 1;
    }

    private runTick() {
        this.currentTime = Date.now();

        // If we're just starting
        if (!this.startTime) {
            this.startTime = this.currentTime;
        }

        const deltaTime = this.currentTime - this.startTime;

        // We've hit our target duration (or overshot it a bit)
        if (deltaTime >= this.duration) {
            const overshoot = deltaTime - this.duration;
            this.callback(overshoot);
            return;
        }


        this.timerId = setTimeout(() => {
            this.runTick();
        }, this.tickDuration);
    }

    start() {
        this.runTick();
    }

    cancel() {
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = undefined;
        }
    }
}
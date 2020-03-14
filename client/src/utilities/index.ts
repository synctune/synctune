
// TODO: reference https://gist.github.com/jvlppm/b4fd92e4579d59d0a9ea5656b865e0d2
export class HighResolutionTimer {
    private totalTicks = 0;
    private timer: number | undefined;
    private startTime: number | undefined;
    private currentTime: number | undefined;
    private deltaTime = 0;

    constructor(public duration: number, public callback: (timer: HighResolutionTimer) => void) {
    }

    run() {
        const lastTime = this.currentTime;
        this.currentTime = Date.now();

        if (!this.startTime) {
            this.startTime = this.currentTime;
        }
        if (lastTime !== undefined) {
            this.deltaTime = (this.currentTime - lastTime);
        }

        this.callback(this);

        const nextTick = this.duration - (this.currentTime - (this.startTime + (this.totalTicks * this.duration)));
        this.totalTicks++;

        this.timer = setTimeout(() => {
            this.run();
        }, nextTick);
    }

    stop() {
        if (this.timer !== undefined) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}
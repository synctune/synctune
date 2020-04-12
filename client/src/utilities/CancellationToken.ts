import Emittable from '@/events/Emittable';

interface CancellationTokenEventMap {
    "requestedCancellation": any;
    "canceled": any;
}

export default class CancellationToken extends Emittable {
    private _requestedCancellation: boolean;
    private _canceled: boolean;

    constructor() {
        super();
        this._requestedCancellation = false;
        this._canceled = false;
    }

    /**
     * Let the token know that a cancellation was requested.
     */
    requestCancellation() {
        this._requestedCancellation = true;
        this.emitEvent("requestedCancellation", null);
    }

    /**
     * Let the token know that the operation was cancelled.
     */
    completedCancellation() {
        if (this._canceled) return;

        this._requestedCancellation = false;
        this._canceled = true;
        this.emitEvent("canceled", null);
    }

    get requestedCancellation() {
        return this._requestedCancellation;
    }

    protected emitEvent<K extends keyof CancellationTokenEventMap>(eventName: K, event: CancellationTokenEventMap[K]) {
        super.emitEvent(eventName, event);
    }

    addEventListener<K extends keyof CancellationTokenEventMap>(eventName: K, listener: (event: CancellationTokenEventMap[K]) => any) {
        super.addEventListener(eventName, listener);
    }

    removeEventListener<K extends keyof CancellationTokenEventMap>(eventName: K, listener: (event: CancellationTokenEventMap[K]) => any) {
        super.addEventListener(eventName, listener);
    }
}
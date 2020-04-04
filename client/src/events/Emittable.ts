interface ListenerRecord {
    listener: Function;
    tag?: string;
}

interface RegisteredListeners {
    [eventName: string]: ListenerRecord[];
}

export default class Emittable {
    protected listeners: RegisteredListeners;

    constructor() {
        this.listeners = {};
    }

    clearListeners(eventName?: string) {
        // If no specific event was given, clear all event listeners
        if (!eventName) {
            this.listeners = {};
            return;
        }

        // Else delete all specific event listeners, if exists
        if (this.listeners[eventName]) {
            delete this.listeners[eventName];
        }
    }

    protected emitEvent(eventName: string, ...args: any[]) {
        const listeners = this.listeners[eventName];

        // No events registered to this event, do nothing
        if (!listeners) {
            return;
        }
        
        listeners.forEach(record => record.listener(...args));
    }

    addEventListener(event: string, listener: Function, tag?: string) {
        const recordItem: ListenerRecord = {
            listener,
            tag
        };

        // No listeners on event yet, add the first one
        if (!this.listeners[event]) {
            this.listeners[event] = [recordItem];
            return;
        }

        this.listeners[event].push(recordItem);
    }

    removeEventListener(event: string, listener: Function) {
        // No listeners on event, so do nothing
        if (!this.listeners[event]) {
            return;
        }

        // Attempt to find listener
        const idx = this.listeners[event].findIndex((record) => record.listener === listener);

        // Listener was found, remove it
        if (idx >= 0) {
            this.listeners[event].splice(idx, 1);
        }
    }

    removeEventListenersByTag(event: string, tag: string) {
        // No listeners on event, so do nothing
        if (!this.listeners[event]) {
            return;
        }

        // Filter out all listeners with the tag
        const listenersFiltered = this.listeners[event].filter(record => record.tag !== tag);
        this.listeners[event] = listenersFiltered;
    }
}
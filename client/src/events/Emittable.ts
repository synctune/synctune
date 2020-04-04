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

    /**
     * Clears all event listeners for the given event name. If no event name is given
     * then all event listeners are cleared.
     * 
     * @param eventName The name of the event to clear.
     */
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

    /**
     * Emits an event with the given arguments.
     * 
     * @param eventName The event name.
     * @param args The arguments.
     */
    protected emitEvent(eventName: string, ...args: any[]) {
        const listeners = this.listeners[eventName];

        // No events registered to this event, do nothing
        if (!listeners) {
            return;
        }
        
        listeners.forEach(record => record.listener(...args));
    }

    /**
     * Adds an event listener to the given event name.
     * 
     * @param eventName The event name.
     * @param listener The listener function.
     * @param tag The tag of the listener (optional).
     */
    addEventListener(eventName: string, listener: Function, tag?: string) {
        const recordItem: ListenerRecord = {
            listener,
            tag
        };

        // No listeners on event yet, add the first one
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [recordItem];
            return;
        }

        this.listeners[eventName].push(recordItem);
    }

    /**
     * Removes an event listener from the given event name.
     * 
     * @param eventName The event name.
     * @param listener The listener function to remove.
     */
    removeEventListener(eventName: string, listener: Function) {
        // No listeners on event, so do nothing
        if (!this.listeners[eventName]) {
            return;
        }

        // Attempt to find listener
        const idx = this.listeners[eventName].findIndex((record) => record.listener === listener);

        // Listener was found, remove it
        if (idx >= 0) {
            this.listeners[eventName].splice(idx, 1);
        }
    }

    /**
     * Removes all event listeners with the given tag from the given event name.
     * 
     * @param eventName The event name.
     * @param tag The listener tag.
     */
    removeEventListenersByTag(eventName: string, tag: string) {
        // No listeners on event, so do nothing
        if (!this.listeners[eventName]) {
            return;
        }

        // Filter out all listeners with the tag
        const listenersFiltered = this.listeners[eventName].filter(record => record.tag !== tag);
        this.listeners[eventName] = listenersFiltered;
    }
}
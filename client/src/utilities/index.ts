import _CancellationToken from "./CancellationToken";
import _HighResolutionTimeout from "./HighResolutionTimeout";

export const CancellationToken = _CancellationToken;
export const HighResolutionTimeout = _HighResolutionTimeout;

// -----------------------------------------------
// --- Helpers for the helpers (helperception) ---
// -----------------------------------------------

// Serializes an given element
function serializeInputEl(el: HTMLElement | string | undefined, selectRoot = false): HTMLElement {
    if (el && el instanceof HTMLElement) {
        // Return the element since it's already one
        return el;
    } else if (el) {
        // Select the element
        return document.querySelector(el) as HTMLElement;
    } else {
        // Return root
        if (selectRoot) {
            return document.documentElement;
        } else {
            throw new Error(`Error: ${el} is an invalid element`);
        }
    }
}

// -----------------------
// --- Utility methods ---
// -----------------------

/**
 * Saves a value to a css property.
 * 
 * @param propertyName The name of the property.
 * @param propertyValue The value to set the property to.
 * @param elSel (Optional) The element or selector for the element. If not given then the root is selected.
 */
export const saveCSSProperty = (propertyName: string, propertyValue: string, elSel?: HTMLElement | string) => {
    // Serialize the input element/query selector/none
    const el = serializeInputEl(elSel, true);
    // Set the custom property
    el.style.setProperty(propertyName, propertyValue);
};

/**
 * Removes a css property.
 * 
 * @param propertyName The name of the property.
 * @param elSel (Optional) The element or selector for the element. If not given then the root is selected.
 */
export const removeCSSProperty = (propertyName: string, elSel?: HTMLElement | string) => {
    // Serialize the input element/query selector/none
    const el = serializeInputEl(elSel, true);
    // Remove the custom property
    el.style.removeProperty(propertyName);
};

/**
 * Returns if the given string is a valid CSS general value
 * Ex: 'auto', 'initial', 'inherit'
 * 
 * @param val The CSS value
 */
export function isCSSGeneralValue(val: string) {
    return ["auto", "initial", "inherit"].includes(val);
}

/**
 * Returns if the given string is a valid CSS length.
 * Ex: '5rem', '20%', '15px, etc
 * 
 * @param length The CSS length.
 */
export function isCSSLength(length: string) {
    const rCSSLengthRegex = /^(\d*?.?\d+)(rem|em|px|cm|mm|in|pt|pc|ch|vw|vh|vmin|vmax|%)$/g;
    return rCSSLengthRegex.test(length) || isCSSGeneralValue(length);
}

/**
 * Returns if the gien string is a valid CSS fractional length.
 * Ex: '1fr', '2fr', etc
 * 
 * @param length The CSS length.
 */
export function isCSSFrUnit(length: string) {
    const rCSSFrUnitRegex = /^(\d*?.?\d+)(fr)$/g;
    return rCSSFrUnitRegex.test(length) || isCSSGeneralValue(length);
}

/**
 * Returns if the given string is a valid CSS rotation.
 * Ex: '45deg', '3.14rad', '400grad', '1turn', etc
 * 
 * @param rotation The CSS rotation.
 */
export function isCSSRotation(rotation: string) {
    const rCSSRotationRegex = /^(\d*?.?\d+)(deg|rad|grad|turn)$/g;
    return rCSSRotationRegex.test(rotation) || isCSSGeneralValue(rotation);
}

/**
 * Returns if the given string is a valid direction.
 * Ie: "right", "left", "up" or "down"
 * 
 * @param direction The direction.
 */
export function isDirection(direction: string) {
    return ["right", "left", "up", "down"].indexOf(direction) !== -1;
}

// TODO: reference https://davidwalsh.name/javascript-debounce-function
export function debounce(func: Function, wait: number, immediate?: boolean) {
    let timeout: number | undefined;
    return function(...args: any[]) {
        const context: any = this;
        const later = function() {
            timeout = undefined;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}




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
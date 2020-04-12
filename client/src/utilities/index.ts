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

/**
 * Converts a rem string value to its equivalent in pixels.
 * 
 * @param rem The rem value string. Ex: '20rem'
 */
export function remToPixel(rem: string): number {
    const rCSSRemRegex = /^(\d*?.?\d+)(rem)$/g;
    const isRem = rCSSRemRegex.test(rem);

    if (!isRem) {
        throw `'${rem}' is not a valid rem value`;
    }

    const remVal = parseFloat(rem.slice(0, -3)); // cut off 'rem' tail and parse as a float
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return remVal * rootPx;
}

/**
 * Converts the given amount of seconds into a more readable format.
 * 
 * @param totalSeconds The number of seconds.
 */
export function displaySecondsString(totalSeconds: number) {
    totalSeconds = Math.round(totalSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const minutesStr = `${minutes}`.padStart(2, "0");
    const secondsStr = `${seconds}`.padStart(2, "0");

    if (hours > 0) {
        const hoursStr = `${hours}`.padStart(2, "0");
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }

    return `${minutesStr}:${secondsStr}`;
}

const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 9;
/**
 * Makes a random choice from a string of characters
 * @param source String from which to choose characters
 */
function choose(choices: string) {
    const index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

/**
 * Generates a random room code.
 */
export function generateRoomCode() {
    let code = "";
    for (let pos = 0; pos < CODE_LENGTH; pos++) {
        code += choose(CODE_CHARS);
    }
    return code;
}

/**
 * Clamps a number by b and c
 * 
 * @param a The value to clamp
 * @param b The lower bound value
 * @param c The upper bound value
 */
export function clamp(a: number, b: number, c: number) {
    return Math.max(b, Math.min(a, c));
}

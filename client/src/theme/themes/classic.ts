/* eslint-disable @typescript-eslint/camelcase */
const LIGHT_1 = "#FFFFFF";
const LIGHT_2 = "#FCF8FF";

const DARK_1 = "#000000";
const DARK_2 = "#180037";

const PURPLE_1 = "#B072FE";
const PURPLE_2 = "#C06CE8";
const PURPLE_3 = "#D274FF";


const PINK_1 = "#F1B8FF";
const PINK_2 = "#FFADFC";
const PINK_3 = "#F9D6FF";
const PINK_4 = "#FC7AFF";

const BLUE_1 = "#87FFF8";

const ERROR_BG = "#FFF9F9";
const ERROR_TEXT = DARK_1;
const ERROR_ACCENT = "#DE1919";

export default {
    name: "classic",
    theme: {
        GLOBAL: {
            background_color: {
                primary: LIGHT_1,
                secondary: LIGHT_2
            },
            text_color: {
                primary: DARK_1,
                secondary: DARK_2
            },
            text_color_inverted: {
                primary: LIGHT_1,
                secondary: LIGHT_1 // TODO: pick a different color
            },
            accent_color: {
                primary: PURPLE_1,
                secondary: PINK_1,
                tertiary: PINK_2
            },
            background_gradient_color: {
                start: LIGHT_1,
                end: PINK_3
            },
            gradient_color: {
                start: PURPLE_2,
                end: PINK_4
            },
            error_color: {
                background: ERROR_BG,
                text: ERROR_TEXT,
                accent: ERROR_ACCENT
            }
        },
        AudioVisualizer: {
            gradient_color: {
                start: PURPLE_3,
                end: BLUE_1
            }
        }
    }
}
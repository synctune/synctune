/* eslint-disable @typescript-eslint/camelcase */
import Color from "color";

const LIGHT_1 = "#FFFFFF";
const LIGHT_2 = "#FCF8FF";
const LIGHT_3 = "#EAEAEA";
const LIGHT_4 = "#F1F1F1";

const DARK_1 = "#000000";
const DARK_2 = "#180037";
const DARK_3 = "#370038";
const DARK_4 = "#909090";
const DARK_5 = "#5E5E5E";

const PURPLE_1 = "#B072FE";
const PURPLE_2 = "#C06CE8";
const PURPLE_3 = "#D274FF";

const PINK_1 = "#F1B8FF";
const PINK_2 = "#FFADFC";
const PINK_3 = "#F9D6FF";
const PINK_4 = "#FC7AFF";
const PINK_5 = "#F9EFFD";
const PINK_6 = "#EA98FF";

const BLUE_1 = "#87FFF8";
const BLUE_2 = "#86DDD7";
const BLUE_3 = "#0FC7FF";
const BLUE_4 = "#CEF8FF";

const ERROR_BG = "#FFF9F9";
const ERROR_TEXT = DARK_1;
const ERROR_ACCENT = "#DE1919";

const INFO_BG = "#F9FFFF";
const INFO_TEXT = DARK_1;
const INFO_ACCENT = "#19D2DE";

const SUCCESS_BG = "#F9FFF9";
const SUCCESS_TEXT = DARK_1;
const SUCCESS_ACCENT = "#29DE19";

const WARNING_BG = "#FFFEF9";
const WARNING_TEXT = DARK_1;
const WARNING_ACCENT = "#DEB319";

const ICON_TEXT = "#434343";
const ICON_TEXT_HOVER = "#624F62";
const ICON_TEXT_CLICK = "#537374";

const DEVICE_ITEM_BG = "#F6F2FF";
const DEVICE_ITEM_BG_ALT = "#EDE7FF";

// Status indicator colors
const STATUS_READY_COLOR = "#46D154";
const STATUS_SYNCING_COLOR = "#8E8E9D";
const STATUS_UPLOADING_COLOR = "#18B0F1";
const STATUS_LOADING_COLOR = STATUS_UPLOADING_COLOR;
const STATUS_ERROR_COLOR = "#FF1212";

const AUDIO_VISUALIZER_GRADIENT_START = PURPLE_3;
const AUDIO_VISUALIZER_GRADIENT_END = BLUE_1;

const HUE_ROTATE_COLOR_1 = "#DF29F1";
const HUE_ROTATE_COLOR_2 = "#F1C429";
const HUE_ROTATE_COLOR_3 = "#2AF129";
const HUE_ROTATE_COLOR_4 = "#299DF1";
const HUE_ROTATE_COLOR_5 = "#29EDF1";
const HUE_ROTATE_COLOR_6 = "#B129F1";

const SEEKBAR_BG = "#FFCFFD";
const SEEKBAR_SEEKER = "#DF1DFF";
const SEEKBAR_DISABLED = "#E3CFE3";

export default {
    name: "classic",
    theme: {
        GLOBAL: {
            background: {
                primary: LIGHT_1,
                secondary: LIGHT_2,
                disabled: LIGHT_4
            },
            text: {
                primary: DARK_1,
                secondary: DARK_2,
                tertiary: DARK_5,
                disabled: DARK_4,
            },
            text_inverted: {
                primary: LIGHT_1,
                secondary: LIGHT_4,
                disabled: LIGHT_3
            },
            accent: {
                primary: PURPLE_1,
                secondary: PINK_1,
                tertiary: PINK_2,
                disabled: Color(PURPLE_1).lighten(0.2).round().toString(), 
            },
            selected: {
                primary: BLUE_3,
                secondary: BLUE_4,
                tertiary: BLUE_1
            },
            background_gradient: {
                start: LIGHT_1,
                end: PINK_3
            },
            gradient: {
                start: PURPLE_2,
                end: PINK_4
            },
            gradient_selected: {
                start: BLUE_2,
                end: BLUE_3
            },
            gradient_disabled: {
                start: Color(PURPLE_2).lighten(0.2).round().toString(),
                end: Color(PINK_4).lighten(0.2).round().toString()
            },
            error: {
                background: ERROR_BG,
                text: ERROR_TEXT,
                accent: ERROR_ACCENT
            },
            info: {
                background: INFO_BG,
                text: INFO_TEXT,
                accent: INFO_ACCENT
            },
            success: {
                background: SUCCESS_BG,
                text: SUCCESS_TEXT,
                accent: SUCCESS_ACCENT
            },
            warning: {
                background: WARNING_BG,
                text: WARNING_TEXT,
                accent: WARNING_ACCENT
            },
            sync_status: {
                ready: STATUS_READY_COLOR,
                syncing: STATUS_SYNCING_COLOR,
                uploading: STATUS_UPLOADING_COLOR,
                loading: STATUS_LOADING_COLOR,
                error: STATUS_ERROR_COLOR
            },
            hue_rotate: {
                color_1: HUE_ROTATE_COLOR_1,
                color_2: HUE_ROTATE_COLOR_2,
                color_3: HUE_ROTATE_COLOR_3,
                color_4: HUE_ROTATE_COLOR_4,
                color_5: HUE_ROTATE_COLOR_5,
                color_6: HUE_ROTATE_COLOR_6,
            }
        },
        AudioVisualizerCircle: {
            gradient: {
                start: AUDIO_VISUALIZER_GRADIENT_START,
                end: AUDIO_VISUALIZER_GRADIENT_END
            },
            gradient_disabled: {
                start: Color(AUDIO_VISUALIZER_GRADIENT_START,).lighten(0.2).round().toString(),
                end: Color(AUDIO_VISUALIZER_GRADIENT_END).lighten(0.2).round().toString()
            }
        },
        ButtonSecondary: {
            text: {
                primary: DARK_3
            },
            accent: {
                tertiary: PINK_5,
                disabled: Color(PINK_1).lighten(0.05).round().toString()
            },
        },
        Home: {
            accent: {
                tertiary: PINK_6
            }
        },
        CircularButton: {
            text: {
                primary: ICON_TEXT,
                secondary: ICON_TEXT_HOVER,
                tertiary: ICON_TEXT_CLICK
            },
            accent: {
                primary: PINK_2,
                secondary: PURPLE_3
            }
        },
        ConnectedDevicesContainer: {
            text: {
                secondary: DARK_4
            }
        },
        ConnectedDeviceItem: {
            text: {
                secondary: DARK_3
            },
            background: {
                primary: DEVICE_ITEM_BG,
                secondary: DEVICE_ITEM_BG_ALT
            }
        },
        AudioSeekbar: {
            text: {
                primary: DARK_3,
                secondary: LIGHT_1
            },
            background: {
                primary: SEEKBAR_BG,
                secondary: SEEKBAR_SEEKER,
                disabled: SEEKBAR_DISABLED
            }
        }
    }
}
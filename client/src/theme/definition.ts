/* eslint-disable @typescript-eslint/camelcase */
import { Schema, Mixins } from "themer";

export const schema: Schema = {
    GLOBAL: {
        background: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'disabled_modifier']
        },
        text: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'tertiary_modifier', 'disabled_modifier']
        },
        text_inverted: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'disabled_modifier']
        },
        accent: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'tertiary_modifier', 'disabled_modifier']
        },
        selected: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'tertiary_modifier']
        },
        background_gradient: {
            $mixins: ['start_modifier', 'end_modifier']
        },
        gradient: {
            $mixins: ['start_modifier', 'end_modifier']
        },
        gradient_selected: {
            $mixins: ['start_modifier', 'end_modifier']
        },
        gradient_disabled: {
            $mixins: ['start_modifier', 'end_modifier']
        },
        // -- Notification colors ---
        error: {
            $mixins: ['background_modifier', 'text_modifier', 'accent_modifier']
        },
        info: {
            $mixins: ['background_modifier', 'text_modifier', 'accent_modifier']
        },
        success: {
            $mixins: ['background_modifier', 'text_modifier', 'accent_modifier']
        },
        warning: {
            $mixins: ['background_modifier', 'text_modifier', 'accent_modifier']
        },
        // -- Sync status colors --
        sync_status: {
            $mixins: ['status_modifiers']
        },
        // -- Hue rotate colors --
        hue_rotate: {
            $mixins: ['hue_rotate_modifiers']
        }
    },
    // --- Component Scope Declarations ---
    // Misc components
    AudioVisualizerCircle: { $inherits: "GLOBAL" },
    AudioSeekbar: { $inherits: "GLOBAL" },
    Container: { $inherits: "GLOBAL" },
    ArtworkThumbnail: { $inherits: "GLOBAL"},
    RoomStatus: { $inherits: "GLOBAL" },
    // Room Components
    RoomConnectionForm: { $inherits: "GLOBAL" },
    RoomConnectionHandler: { $inherits: "GLOBAL" },
    ConnectedDevicesContainer: { $inherits: "GLOBAL" },
    ConnectedDeviceItem: { $inherits: "GLOBAL" },
    MusicControlsContainer: { $inherits: "GLOBAL" },
    CurrentSongContainer: { $inherits: "GLOBAL" },
    // Buttons
    ButtonPrimary: { $inherits: "GLOBAL" },
    ButtonSecondary: { $inherits: "GLOBAL" },
    CircularButton: { $inherits: "GLOBAL" },
    CircularIconButton: { $inherits: "GLOBAL" },
    BackButton: { $inherits: "GLOBAL" },
    ButtonInputHybrid: { $inherits: "GLOBAL" },
    MiniIconButton: { $inherits: "GLOBAL" },
    SyncButton: { $inherits: "GLOBAL" },
    UploadButton: { $inherits: "GLOBAL" },
    // Loaders/spinners/rings
    CircleLoader: { $inherits: "GLOBAL" },
    UploadingLoader: { $inherits: "GLOBAL" },
    CircleSpinner: { $inherits: "GLOBAL" },
    SvgRing: { $inherits: "GLOBAL" },
    // Forms
    InputField: { $inherits: "GLOBAL" },
    // Icons
    IconBase: { $inherits: "GLOBAL" },
    IconClickable: { $inherits: "GLOBAL" },
    // Status stuff
    StatusIndicator: { $inherits: "GLOBAL" },
    BaseMode: { $inherits: "GLOBAL" },
    ErrorMode: { $inherits: "GLOBAL" },
    LoadingMode: { $inherits: "GLOBAL" },
    ReadyMode: { $inherits: "GLOBAL" },
    SyncingMode: { $inherits: "GLOBAL" },
    UploadingMode: { $inherits: "GLOBAL" },
    // Views
    Home: { $inherits: "GLOBAL" },
    Room: { $inherits: "GLOBAL" },
    RoomCreate: { $inherits: "GLOBAL" },
    RoomJoin: { $inherits: "GLOBAL" },
};

export const mixins: Mixins = {
    // --- Modifiers ---
    primary_modifier: {
        primary: {
            $type: "color",
            $required: true
        }
    },
    secondary_modifier: {
        secondary: {
            $type: "color",
            $required: true
        }
    },
    tertiary_modifier: {
        tertiary: {
            $type: "color",
            $required: true
        },
    },
    quaternary_modifier: {
        quaternary: {
            $type: "color",
            $required: true
        }
    },
    disabled_modifier: {
        disabled: {
            $type: "color",
            $required: true
        }
    },
    start_modifier: {
        start: {
            $type: "color",
            $required: true
        }
    },
    end_modifier: {
        end: {
            $type: "color",
            $required: true
        }
    },
    background_modifier: {
        background: {
            $type: "color",
            $required: true
        }
    },
    text_modifier: {
        text: {
            $type: "color",
            $required: true
        }
    },
    accent_modifier: {
        accent: {
            $type: "color",
            $required: true
        }
    },
    status_modifiers: {
        ready: {
            $type: "color",
            $required: true
        },
        syncing: {
            $type: "color",
            $required: true
        },
        uploading: {
            $type: "color",
            $required: true
        },
        loading: {
            $type: "color",
            $required: true
        },
        error: {
            $type: "color",
            $required: true
        }
    },
    hue_rotate_modifiers: {
        color_1: {
            $type: "color",
            $required: true
        },
        color_2: {
            $type: "color",
            $required: true
        },
        color_3: {
            $type: "color",
            $required: true
        },
        color_4: {
            $type: "color",
            $required: true
        },
        color_5: {
            $type: "color",
            $required: true
        },
        color_6: {
            $type: "color",
            $required: true
        }
    }
};
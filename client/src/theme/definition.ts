/* eslint-disable @typescript-eslint/camelcase */
import { Schema, Mixins } from "themer";

export const schema: Schema = {
    GLOBAL: {
        background: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'disabled_modifier']
        },
        text: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'disabled_modifier']
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
        error: {
            $mixins: ['background_modifier', 'text_modifier', 'accent_modifier']
        }
    },
    // Components
    AudioVisualizer: {
        $inherits: "GLOBAL"
    },
    Container: {
        $inherits: "GLOBAL"
    },
    ButtonPrimary: {
        $inherits: "GLOBAL"
    },
    ButtonSecondary: {
        $inherits: "GLOBAL"
    },
    RoomConnectionForm: {
        $inherits: "GLOBAL"
    },
    RoomConnectionHandler: {
        $inherits: "GLOBAL"
    },
    // Views
    Home: {
        $inherits: "GLOBAL"
    },
    Room: {
        $inherits: "GLOBAL"
    },
    RoomCreate: {
        $inherits: "GLOBAL"
    },
    RoomJoin: {
        $inherits: "GLOBAL"
    },
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
    }
};
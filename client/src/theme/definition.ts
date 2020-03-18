/* eslint-disable @typescript-eslint/camelcase */
import { Schema, Mixins } from "themer";

export const schema: Schema = {
    GLOBAL: {
        background_color: {
            $mixins: ['primary_modifier', 'secondary_modifier']
        },
        text_color: {
            $mixins: ['primary_modifier', 'secondary_modifier']
        },
        text_color_inverted: {
            $mixins: ['primary_modifier', 'secondary_modifier']
        },
        accent_color: {
            $mixins: ['primary_modifier', 'secondary_modifier', 'tertiary_modifier']
        },
        background_gradient_color: {
            $mixins: ['start_modifier', 'end_modifier']
        },
        gradient_color: {
            $mixins: ['start_modifier', 'end_modifier']
        },
        error_color: {
            $mixins: ['background_modifier', 'text_modifier', 'accent_modifier']
        }
    },
    // Components
    AudioVisualizer: {
        $inherits: "GLOBAL"
    }
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
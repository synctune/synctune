import Vue from "vue";
import { Module, GetterTree, MutationTree, ActionTree } from "vuex";
import { RootState } from "../../index";
import Themer, { Theme as ThemeSchema } from "themer";
import { schema as SCHEMA, mixins as MIXINS } from "../../../theme/definition";

// -------------------------
// --- Type Declarations ---
// -------------------------

export type ThemeName = string;

export interface ThemeProperties {
    [propertyName: string]: string;
}

export interface Theme {
    name: ThemeName;
    properties: ThemeProperties;
}

export interface ThemeState {
    themes: {
        [themeName: string]: Theme;
    };
    namespaces: {
        [namespaceID: string]: ThemeName;
    };
}

interface ThemePayload {
    name: ThemeName;
    themeValues: ThemeSchema;
    override: boolean;
}

interface NamespacePayload {
    name: string;
    targetTheme: ThemeName;
    override: boolean;
}

export enum Getters {
    getAllThemes = "getAllThemes",
    getTheme = "getTheme",
    getAllNamespaces = "getAllNamespaces",
    getNamespace = "getNamespace"   
}

export enum Mutations {
    addTheme = "addTheme",
    editTheme = "editTheme",
    removeTheme = "removeTheme",
    addNamespace = "addNamespace",
    editNamespace = "editNamespace",
    removeNamespace = "removeNamespace"
}

export enum Actions {
    addTheme = "addTheme",
    editTheme = "editTheme",
    removeTheme = "removeTheme",
    addNamespace = "addNamespace",
    editNamespace = "editNamespace",
    removeNamespace = "removeNamespace"
}

export interface MapGettersStructure {
    [Getters.getAllThemes]: Theme[];
    [Getters.getTheme]: (themeName: ThemeName) => Theme | undefined;
    [Getters.getAllNamespaces]: ThemeName[];
    [Getters.getNamespace]: (namespaceID: string) => ThemeName | undefined;
}

export interface MapMutationsStructure {
    [Mutations.addTheme](payload: ThemePayload): void;
    [Mutations.editTheme](payload: Omit<ThemePayload, "override">): void;
    [Mutations.removeTheme](payload: Omit<ThemePayload, "themeSchema" | "override">): void;
    [Mutations.addNamespace](payload: NamespacePayload): void;
    [Mutations.editNamespace](payload: Omit<NamespacePayload, "override">): void;
    [Mutations.removeNamespace](payload: Omit<NamespacePayload, "targetTheme" | "override">): void;
}

export interface MapActionsStructure {
    [Actions.addTheme](payload: ThemePayload): void;
    [Actions.editTheme](payload: Omit<ThemePayload, "override">): void;
    [Actions.removeTheme](payload: Omit<ThemePayload, "themeSchema" | "override">): void;
    [Actions.addNamespace](payload: NamespacePayload): void;
    [Actions.editNamespace](payload: Omit<NamespacePayload, "override">): void;
    [Actions.removeNamespace](payload: Omit<NamespacePayload, "targetTheme" | "override">): void;
}


// -----------------------
// --- Check Functions ---
// -----------------------

const _checkThemeExists = (state: ThemeState, themeName: ThemeName): never | void => {
    if (!state.themes[themeName]) {
        throw `Error: theme '${themeName}' does not exist`;
    }
};

const _checkThemeDoesNotExist = (state: ThemeState, themeName: ThemeName): never | void => {
    if (state.themes[themeName]) {
        throw `Error: theme '${themeName}' already exists`;
    }
};

const _checkNamespaceExists = (state: ThemeState, namespaceID: string): never | void => {
    if (!state.namespaces[namespaceID]) {
        throw `Error: namespace '${namespaceID}' does not exist`;
    }
};

const _checkNamespaceDoesNotExist = (state: ThemeState, namespaceID: string): never | void => {
    if (state.namespaces[namespaceID]) {
        throw `Error: namespace '${namespaceID}' already exists`;
    }
};


// -------------------
// --- Theme Store ---
// -------------------

const namespaced = false;

const state: ThemeState = {
    themes: {},
    namespaces: {}
};

const getters: GetterTree<ThemeState, RootState> = {
    // Theme getters
    [Getters.getAllThemes]: (state): Theme[] => {
        return Object.values(state.themes);
    },
    [Getters.getTheme]: (state) => {
        return (themeName: ThemeName): Theme | undefined => {
            return state.themes[themeName];
        }
    },
    // Namespace getters
    [Getters.getAllNamespaces]: (state): string[] => {
        return Object.values(state.namespaces);
    },
    [Getters.getNamespace]: (state) => {
        return (namespaceID: string): string | undefined => {
            return state.namespaces[namespaceID];
        }
    }
};

const mutations: MutationTree<ThemeState> = {
    // Theme mutations
    [Mutations.addTheme]: (state, payload: ThemePayload) => {
        const { name, themeValues, override } = payload;

        // Make sure theme does not exist if we are not overriding it
        if (!override) {
            _checkThemeDoesNotExist(state, name);
        }

        // Generate the theme
        const generateOptions = {
            PREFIX: "--",
            CONDENSE_KEYS: true
        };
        const generatedTheme = Themer.generate(themeValues, SCHEMA, MIXINS, {}, generateOptions);

        // Add the theme
        Vue.set(state.themes, name, { name, properties: generatedTheme});
    },
    [Mutations.removeTheme]: (state, payload: Omit<ThemePayload, "themeSchema" | "override">) => {
        const { name } = payload;

        _checkThemeExists(state, name);

        // Remove the theme
        Vue.delete(state.themes, name);
    },
    [Mutations.editTheme]: (state, payload: Omit<ThemePayload, "override">) => {
        const { name, themeValues } = payload;

        _checkThemeExists(state, name);

        // Generate the updated theme
        const updatedGeneratedTheme = Themer.generate(themeValues, SCHEMA, MIXINS, {}, { PREFIX: "--" });

        // Update the theme's data
        Vue.set(state.themes, name, { name, properties: updatedGeneratedTheme });
    },
    // Namespace mutations
    [Mutations.addNamespace]: (state, payload: NamespacePayload) => {
        const { name, targetTheme, override } = payload;

        if (!override) {
            _checkNamespaceDoesNotExist(state, name);
        }

        // Add the namespace
        Vue.set(state.namespaces, name, targetTheme);
    },
    [Mutations.removeNamespace]: (state, payload: Omit<NamespacePayload, "targetTheme" | "override">) => {
        const { name } = payload;

        _checkNamespaceExists(state, name);

        // Remove the namespace
        Vue.delete(state.namespaces, name);
    },
    [Mutations.editNamespace]: (state, payload: Omit<NamespacePayload, "override">) => {
        const { name, targetTheme } = payload;

        _checkNamespaceExists(state, name);

        // Edit the theme target        
        Vue.set(state.namespaces, name, targetTheme);
    }
};

const actions: ActionTree<ThemeState, RootState> = {
    // Theme actions
    [Actions.addTheme]: ({ commit }, payload: ThemePayload) => {        
        commit(Mutations.addTheme, payload);
    },
    [Actions.removeTheme]: ({ commit }, payload: Omit<ThemePayload, "themeSchema" | "override">) => {
        commit(Mutations.removeTheme, payload);
    },
    [Actions.editTheme]: ({ commit }, payload: Omit<ThemePayload, "override">) => {
        commit(Mutations.editTheme, payload);
    },
    // Namespace actions
    [Actions.addNamespace]: ({ commit }, payload: NamespacePayload) => {
        commit(Mutations.addNamespace, payload);
    },
    [Actions.removeNamespace]: ({ commit }, payload: Omit<NamespacePayload, "targetTheme" | "override">) => {
        commit(Mutations.removeNamespace, payload);
    },
    [Actions.editNamespace]: ({ commit }, payload: Omit<NamespacePayload, "override">) => {
        commit(Mutations.editNamespace, payload);
    }
};

const themeModule: Module<ThemeState, RootState> = {
    namespaced,
    state,
    getters,
    mutations,
    actions
};

export default themeModule;
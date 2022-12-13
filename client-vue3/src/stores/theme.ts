import { defineStore } from "pinia";
import Themer from "themer";
import { computed, reactive, type ComputedRef } from "vue";
import { schema as SCHEMA, mixins as MIXINS } from "@/theme/definition";
import type { Theme as ThemeSchema } from "themer";

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

const THEME_PREFIX = "--";

export const useThemeStore = defineStore("theme", () => {
  const state = reactive<ThemeState>({
    themes: {},
    namespaces: {},
  });

  const _checkThemeExists = (themeName: ThemeName): never | void => {
    if (!state.themes[themeName]) {
      throw `Error: theme '${themeName}' does not exist`;
    }
  };

  const _checkThemeDoesNotExist = (themeName: ThemeName): never | void => {
    if (state.themes[themeName]) {
      throw `Error: theme '${themeName}' already exists`;
    }
  };

  const _checkNamespaceExists = (namespaceID: string): never | void => {
    if (!state.namespaces[namespaceID]) {
      throw `Error: namespace '${namespaceID}' does not exist`;
    }
  };

  const _checkNamespaceDoesNotExist = (namespaceID: string): never | void => {
    if (state.namespaces[namespaceID]) {
      throw `Error: namespace '${namespaceID}' already exists`;
    }
  };

  const allThemes = computed(() => Object.values(state.themes));

  const allNamespaces = computed(() => Object.values(state.namespaces));

  const getTheme = (name: string) => state.themes[name];

  const getNamespace = (name: string) => state.namespaces[name];

  const addTheme = (
    name: string,
    themeValues: ThemeSchema,
    override = false
  ) => {
    // Make sure theme does not exist if we are not overriding it
    if (!override) {
      _checkThemeDoesNotExist(name);
    }

    // Generate the theme
    const generateOptions = {
      PREFIX: THEME_PREFIX,
      CONDENSE_KEYS: true,
    };
    const generatedTheme = Themer.generate(
      themeValues,
      SCHEMA,
      MIXINS,
      {},
      generateOptions
    );

    state.themes[name] = { name, properties: generatedTheme };
  };

  const removeTheme = (name: string) => {
    _checkThemeExists(name);

    delete state.themes[name];
  };

  const editTheme = (name: string, themeValues: ThemeSchema) => {
    _checkThemeExists(name);

    // Generate the updated theme
    const updatedGeneratedTheme = Themer.generate(
      themeValues,
      SCHEMA,
      MIXINS,
      {},
      { PREFIX: THEME_PREFIX }
    );

    state.themes[name] = { name, properties: updatedGeneratedTheme };
  };

  const addNamespace = (
    name: string,
    targetTheme: string,
    override = false
  ) => {
    if (!override) {
      _checkNamespaceDoesNotExist(name);
    }

    state.namespaces[name] = targetTheme;
  };

  const removeNamespace = (name: string) => {
    _checkNamespaceExists(name);

    delete state.namespaces[name];
  };

  const editNamespace = (name: string, targetTheme: string) => {
    _checkNamespaceExists(name);

    state.namespaces[name] = targetTheme;
  };

  return {
    state,
    allThemes,
    allNamespaces,
    getTheme,
    getNamespace,
    addTheme,
    removeTheme,
    editTheme,
    addNamespace,
    removeNamespace,
    editNamespace,
  };
});

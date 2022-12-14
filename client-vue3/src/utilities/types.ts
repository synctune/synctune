export type Nullish = null | undefined;

// Source: https://stackoverflow.com/a/70387184
/** Appends the prefix P to all the keys in object T. */
export type AddPrefixToObject<T, P extends string> = {
  [K in keyof T as K extends string ? `${P}${K}` : never]: T[K];
};

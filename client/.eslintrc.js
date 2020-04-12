module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "plugin:vue/essential",
        "@vue/typescript/recommended",
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "vue/script-indent": ["error", 4, {
            "baseIndent": 0,
            "switchCase": 0,
            "ignores": []
        }],
        "vue/no-unused-vars": "warn",
        "vue/no-unused-components": "warn",
        indent: ["error", 4, { "SwitchCase": 1, "ObjectExpression": 1, "ArrayExpression": 1 }],
        "no-empty-function": ["error", { "allow": ["functions"] }],
        "@typescript-eslint/no-empty-function": ["error", { "allow": ["functions"] }],
        "@typescript-eslint/no-explicit-any": 0, // Disable
        "@typescript-eslint/no-empty-interface": ["warn"],
        "no-empty-function": "off",
        "@typescript-eslint/no-empty-function": "warn",
        "@typescript-eslint/triple-slash-reference": "warn",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "off"
    }
};

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  { ignores: ["**/.*"] },
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-extra-semi": "error",
      "no-inner-declarations": ["error", "functions", { blockScopedFunctions: "disallow" }],
      "no-mixed-spaces-and-tabs": "error",
      "no-new-symbol": "error",
      indent: ["warn", 2],
      "eol-last": ["warn", "always"],
      "no-unused-vars": ["warn", { caughtErrors: "none" }],
      "no-console": "warn",
      semi: ["warn", "always"],
      quotes: ["warn", "double", { avoidEscape: true }],
    },
  },
];

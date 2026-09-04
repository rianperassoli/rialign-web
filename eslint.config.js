import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: { parser: ts.parser }
    },
    rules: {
      // Compiler warnings have one owner: `npm run check` (and the dev server),
      // which read the `warningFilter` in svelte.config.js. ESLint cannot see
      // that filter, so leaving this on reports warnings the project has
      // already ruled on.
      "svelte/valid-compile": "off"
    }
  },
  {
    rules: {
      // `_` is the conventional name for a binding that exists only to reach
      // the next one, e.g. the index in `{#each Array(n) as _, i}`.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
    }
  },
  {
    ignores: ["build/", ".svelte-kit/", "package/", "node_modules/"]
  }
);

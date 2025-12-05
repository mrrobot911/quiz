import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default defineConfig(eslint.configs.recommended, ...tseslint.configs.recommended, {
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    ...prettierConfig.rules,
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-console": "warn",
  },
});

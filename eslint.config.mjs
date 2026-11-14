import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    ".npm-cache/**",
    ".npm-logs/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

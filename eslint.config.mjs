import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // This project intentionally uses simple "fetch on mount" client
      // components (no SWR/React Query) to keep the dependency graph small.
      // That pattern is flagged by this newer rule; disabling it here is a
      // deliberate simplicity trade-off rather than an oversight.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
  ]),
]);

export default eslintConfig;

import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      // Framework wiring is excluded; Playwright exercises the layout's integration.
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
        "src/app/**/layout.tsx",
        "src/app/**/metadata.{ts,tsx}",
      ],
      reporter: ["text", "json", "html"],
      reportOnFailure: true,
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});

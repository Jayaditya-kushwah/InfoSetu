import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "cobertura"],
      include: ["src/lib/**/*.ts"],
      exclude: ["**/*.test.ts", "src/app/**"],
      thresholds: {
        lines: 10,
        functions: 10,
        branches: 10,
        statements: 10,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

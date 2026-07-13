import { defineConfig } from "vitest/config";

// Unit tests run plugin-free in a node environment (pure TS units like
// formatting). Kept separate from vite.config.ts so the app's Vite plugins
// aren't type-checked against Vitest's bundled Vite.
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "node",
    globals: true
  }
});

import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests run plugin-free in a node environment (pure TS units like
// formatting). Kept separate from vite.config.ts so the app's Vite plugins
// aren't type-checked against Vitest's bundled Vite.
export default defineConfig({
  // Without SvelteKit's plugin the $lib alias has to be declared by hand.
  resolve: {
    alias: { $lib: fileURLToPath(new URL("./src/lib", import.meta.url)) }
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "node",
    globals: true
  }
});

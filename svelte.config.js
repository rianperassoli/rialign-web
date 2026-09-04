import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  // The only warning we drop. It asks components to stop using rest props so a
  // custom element could infer them — we ship no custom elements, and the rest
  // props on Input/Select/Button are what let them forward native attributes.
  compilerOptions: {
    warningFilter: (warning) => warning.code !== "custom_element_props_identifier"
  },
  kit: {
    adapter: adapter(),
    alias: {
      $components: "src/lib/components",
      $composables: "src/lib/composables",
      $api: "src/lib/api",
      $utils: "src/lib/utils"
    }
  }
};

export default config;

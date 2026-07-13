import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  // `state_referenced_locally` fires on our intentional pattern of passing page
  // `data`/props once into a composable that then owns the state. The `check`
  // script already ignores it; mirror that here so the dev server and every
  // other tool stay quiet too.
  compilerOptions: {
    warningFilter: (warning) => warning.code !== "state_referenced_locally"
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

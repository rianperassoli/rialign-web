import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      emitTsDeclarations: true,
      // Fallback chain, in order: an explicit choice (the cookie the settings
      // selector will write), then the browser's own languages — a visitor in
      // Brazil lands on pt-BR — and finally en-US, which the UI is written in.
      // The cookie is first so a manual choice always beats the browser.
      strategy: ["cookie", "preferredLanguage", "baseLocale"]
    })
  ]
});

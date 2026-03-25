// @ts-check

import { createRequire } from "node:module";
import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";
import { normalizePath } from "vite";

const require = createRequire(import.meta.url);

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs()],
  vite: {
    resolve: {
      alias: {
        // https://github.com/vitejs/vite/issues/7439#issuecomment-3677754335
        "decode-named-character-reference": normalizePath(
          require.resolve("decode-named-character-reference"),
        ),
      },
    },
    plugins: [
      {
        name: "solid-icons-prerender-fix",
        // solid-icons ships .jsx files that Node.js can't handle during prerendering
        configEnvironment(name, _options) {
          if (name === "prerender") {
            return {
              resolve: {
                noExternal: true,
              },
            };
          }
        },
      },
    ],
  },
  base: process?.env.WEBSITE_BASE_PATH || undefined,
});

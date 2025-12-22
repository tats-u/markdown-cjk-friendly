// @ts-check

import { createRequire } from "node:module";
import solidJs from "@astrojs/solid-js";
import { defineConfig } from "astro/config";
import relativeLinks from "astro-relative-links";
import { normalizePath } from "vite";

const require = createRequire(import.meta.url);

// https://astro.build/config
export default defineConfig({
  integrations: [solidJs(), relativeLinks()],
  vite: {
    resolve: {
      alias: {
        // https://github.com/vitejs/vite/issues/7439#issuecomment-3677754335
        "decode-named-character-reference": normalizePath(
          require.resolve("decode-named-character-reference"),
        ),
      },
    },
  },
});

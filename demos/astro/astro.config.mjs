import mdx from "@astrojs/mdx";
// @ts-check
import { defineConfig } from "astro/config";
import remarkCjkFriendly from "remark-cjk-friendly/parseOnly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/parseOnly";
import { unified } from "@astrojs/markdown-remark";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(
      // You can set it below in markdown, so you don't need to set it here again.
      // {
      //   gfm: true,
      //   remarkPlugins: [remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough],
      // }
    ),
  ],
  markdown: {
    // unified({ ... }) is mandatory as for now (has NOT been compatible with Sätteri yet)
    processor: unified({
      gfm: true,
      // If you turn off `gfm`, `remarkCjkFriendlyGfmStrikethrough` is not needed.
      remarkPlugins: [remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough],
    }),
  },
});

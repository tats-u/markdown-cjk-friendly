import mdx from "@astrojs/mdx";
// @ts-check
import { defineConfig } from "astro/config";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";

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
    gfm: true,
    // If you turn off `gfm`, `remarkCjkFriendlyGfmStrikethrough` is not needed.
    remarkPlugins: [remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough],
  },
});

import * as path from "node:path";
import { defineConfig } from "@rspress/core";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfmStrikethroughCjkFriendly from "remark-cjk-friendly-gfm-strikethrough";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "Rspress Demo",
  icon: "/rspress-icon.png",
  logo: {
    light: "/rspress-light-logo.png",
    dark: "/rspress-dark-logo.png",
  },
  lang: "ja",
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/tats-u/markdown-cjk-friendly",
      },
    ],
    search: false,
  },
  markdown: {
    // mdxRs: false, // IMPORTANT! This is mandatory for Rspress 1.x! (you don't need to set this in Rspress 2.x because it is removed in 2.x)
    // Once you turn off `mdxRs` in 1.x or upgrade Rspress to 2.x, you can add `remarkPlugins` and `rehypePlugins` like other remark-based site generators.
    remarkPlugins: [remarkCjkFriendly, remarkGfmStrikethroughCjkFriendly],
  },
});

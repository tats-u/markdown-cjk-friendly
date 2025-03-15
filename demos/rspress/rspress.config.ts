import * as path from "node:path";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfmStrikethroughCjkFriendly from "remark-cjk-friendly-gfm-strikethrough";
import { defineConfig } from "rspress/config";

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
    mdxRs: false, // IMPORTANT! This is mandatory for Rspress!
    // Once you turn off `mdxRs`, you can add `remarkPlugins` and `rehypePlugins` like other remark-based site generators.
    remarkPlugins: [remarkCjkFriendly, remarkGfmStrikethroughCjkFriendly],
  },
});

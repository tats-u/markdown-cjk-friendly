import markdownItCjkFriendly from "markdown-it-cjk-friendly";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "VitePress Demo",
  description: "VitePress Demo",
  markdown: {
    config: (md) => {
      md.use(markdownItCjkFriendly); // All you have to append
    },
  },
  lang: "ja",
});

---
"remark-cjk-friendly-gfm-strikethrough": minor
"remark-cjk-friendly": minor
---

feat(remark-*): add new entry points /parseOnly & /serializeOnly

Added new entry points for both `remark-cjk-friendly` and `remark-cjk-friendly-gfm-strikethrough` packages, allowing users to import only the parsing or serialization functionality as needed. This change helps reduce bundle size for users who only require one of the functionalities.

When you want to use only the parsing functionality, or if you have been using these packages since v2.0.1 or earlier, you can now import plugins from `remark-cjk-friendly/parseOnly` and/or `remark-cjk-friendly-gfm-strikethrough/parseOnly`:

```diff
-import remarkCjkFriendly from "remark-cjk-friendly";
-import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
+import remarkCjkFriendly from "remark-cjk-friendly/parseOnly";
+import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/parseOnly";

 const processor = unified()
   .use(remarkParse)
   .use(remarkGfm)
   .use(remarkCjkFriendly)
   .use(remarkCjkFriendlyGfmStrikethrough)
   .use(remarkRehype)
   .use(rehypeStringify);
```

If you only need the serialization functionality, you can import from `remark-cjk-friendly/serializeOnly` and/or `remark-cjk-friendly-gfm-strikethrough/serializeOnly`:

```diff
-import remarkCjkFriendly from "remark-cjk-friendly";
-import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
+import remarkCjkFriendly from "remark-cjk-friendly/serializeOnly";
+import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/serializeOnly";

 const processor = unified()
   .use(rehypeParse)
   .use(remarkRehype, { allowDangerousHtml: true })
   .use(remarkCjkFriendly)
   .use(remarkCjkFriendlyGfmStrikethrough)
   .use(remarkStringify);
```

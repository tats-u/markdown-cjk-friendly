---
"remark-cjk-friendly-gfm-strikethrough": minor
"remark-cjk-friendly": minor
---

feat(remark-*): add new entry point `/bidi`

I may have made a design mistake in v2.1.0—most users only needs parsing, but I added serialization as an opt-out, increasing the bundle size by a few KB. For the next major version upgrade, I may introduce a breaking change to enable only parsing (currently `/parseOnly`) unless a subpath is specified, just like in v2.0.1 or earlier, in a future release. To prepare, I've added a new entry point `/bidi` for users using both parsing and serialization. I recommend updating your `import` statements now:

```diff
-import remarkCjkFriendly from "remark-cjk-friendly";
-import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
+import remarkCjkFriendly from "remark-cjk-friendly/bidi";
+import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/bidi";
```

If you're a user who has been using these plugins since v2.0.1 or earlier and don't particularly care about bundle size, feel free to import them either with or without the `/parseOnly` suffix.

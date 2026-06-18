---
"remark-cjk-friendly-gfm-strikethrough": patch
"remark-cjk-friendly": patch
---

fix(remark-*): add /bidi entry point to package.json

The `/bidi` entry points were advertised as available starting from v2.3.0, but they were not actually exported in `package.json`, so users could not use them.

With this fix, the `/bidi` entry points are now officially available for use. If you want to use both parsing and serialization, please update your `import` statements to use the `/bidi` entry points as shown below:

```diff
-import remarkCjkFriendly from "remark-cjk-friendly";
-import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
+import remarkCjkFriendly from "remark-cjk-friendly/bidi";
+import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/bidi";
```

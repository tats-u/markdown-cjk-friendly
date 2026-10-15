# mdast-util-to-markdown-cjk-friendly-gfm-strikethrough

`mdast-util-to-markdown` extension package for GFM strikethrough serialization in the CJK-friendly remark stack.

Requires `mdast-util-to-markdown` 2.1.3 or later and `mdast-util-gfm-strikethrough` 2.0.1 or later.

## Usage

```js
import { toMarkdown } from "mdast-util-to-markdown";
import { cjkFriendlyGfmStrikethroughToMarkdown } from "mdast-util-to-markdown-cjk-friendly-gfm-strikethrough";

const markdown = toMarkdown(tree, {
  extensions: [cjkFriendlyGfmStrikethroughToMarkdown()],
});
```

This package is also loaded automatically by `remark-cjk-friendly-gfm-strikethrough`.

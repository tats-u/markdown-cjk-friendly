# mdast-util-to-markdown-cjk-friendly-gfm-strikethrough

`mdast-util-to-markdown` extension package for GFM strikethrough serialization in the CJK-friendly remark stack.

## Usage

```js
import { toMarkdown } from "mdast-util-to-markdown";
import { cjkFriendlyGfmStrikethroughToMarkdown } from "mdast-util-to-markdown-cjk-friendly-gfm-strikethrough";

const markdown = toMarkdown(tree, {
  extensions: [cjkFriendlyGfmStrikethroughToMarkdown()],
});
```

This package is also loaded automatically by `remark-cjk-friendly-gfm-strikethrough`.

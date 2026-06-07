# mdast-util-to-markdown-cjk-friendly

`mdast-util-to-markdown` extension for CJK-friendly emphasis and strong serialization.

## Usage

```js
import { toMarkdown } from "mdast-util-to-markdown";
import { cjkFriendlyToMarkdown } from "mdast-util-to-markdown-cjk-friendly";

const markdown = toMarkdown(tree, {
  extensions: [cjkFriendlyToMarkdown()],
});
```

This package is also loaded automatically by `remark-cjk-friendly`.

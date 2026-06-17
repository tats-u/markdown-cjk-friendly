import type { Root } from "mdast";
import { cjkFriendlyGfmStrikethroughToMarkdown } from "mdast-util-to-markdown-cjk-friendly-gfm-strikethrough";
import type { Processor } from "unified";

/**
 * Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK).
 *
 * This plugin only supports serializing.
 */
export default function remarkCjkFriendlyGfmStrikethroughSerializeOnly(
  this: unknown,
): void {
  const data = (this as Processor<Root>).data() as {
    toMarkdownExtensions?: unknown[];
  };
  const toMarkdownExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  toMarkdownExtensions.push(cjkFriendlyGfmStrikethroughToMarkdown());
}

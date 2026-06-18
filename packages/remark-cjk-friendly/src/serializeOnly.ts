import type { Root } from "mdast";
import { cjkFriendlyToMarkdown } from "mdast-util-to-markdown-cjk-friendly";
import type { Processor } from "unified";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 *
 * This plugin only supports serializing.
 */
export default function remarkCjkFriendly(this: unknown): void {
  const data = (this as Processor<Root>).data() as {
    toMarkdownExtensions?: unknown[];
  };
  const toMarkdownExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  toMarkdownExtensions.push(cjkFriendlyToMarkdown());
}

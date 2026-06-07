import type { Root } from "mdast";
import { cjkFriendlyToMarkdown } from "mdast-util-to-markdown-cjk-friendly";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import type { Processor } from "unified";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 */
export default function remarkCjkFriendly(this: unknown): void {
  const data = (this as Processor<Root>).data() as {
    micromarkExtensions?: unknown[];
    toMarkdownExtensions?: unknown[];
  };
  const micromarkExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const toMarkdownExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(cjkFriendlyExtension());
  toMarkdownExtensions.push(cjkFriendlyToMarkdown());
}

import type { Root } from "mdast";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import type { Processor } from "unified";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 */
export default function remarkCjkFriendly(this: unknown): void {
  const data = (this as Processor<Root>).data() as {
    micromarkExtensions?: unknown[];
  };
  const micromarkExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.micromarkExtensions || (data.micromarkExtensions = []);

  micromarkExtensions.push(cjkFriendlyExtension());
}

import type { Root } from "mdast";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import type { Processor } from "unified";
import type remarkCjkFriendly from "./index.ts";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 *
 * This plugin only supports parsing. If you have been using {@linkcode remarkCjkFriendly} (`remark-cjk-friendly`) since v2.0.1 or earlier, it is recommended to migrate to this to minimize bundled dependencies.
 */
export default function remarkCjkFriendlyParseOnly(this: unknown): void {
  const data = (this as Processor<Root>).data() as {
    micromarkExtensions?: unknown[];
  };
  const micromarkExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.micromarkExtensions || (data.micromarkExtensions = []);

  micromarkExtensions.push(cjkFriendlyExtension());
}

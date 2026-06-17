import type { Root } from "mdast";
import {
  gfmStrikethroughCjkFriendly,
  type Options,
} from "micromark-extension-cjk-friendly-gfm-strikethrough";
import type { Processor } from "unified";
import type remarkCjkFriendlyGfmStrikethrough from "./index.ts";
export type { Options };

/**
 * Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK).
 *
 * This plugin only supports parsing. If you have been using {@linkcode remarkCjkFriendlyGfmStrikethrough} (`remark-cjk-friendly-gfm-strikethrough`) since v2.0.1 or earlier, it is recommended to migrate to this to minimize bundled dependencies.
 */
export default function remarkCjkFriendlyGfmStrikethroughParseOnly(
  this: unknown,
  options?: Options | null,
): void {
  const data = (this as Processor<Root>).data() as {
    micromarkExtensions?: unknown[];
  };
  const micromarkExtensions =
    // biome-ignore lint/suspicious/noAssignInExpressions: base plugin (remark-gfm) already does this
    data.micromarkExtensions || (data.micromarkExtensions = []);

  micromarkExtensions.push(gfmStrikethroughCjkFriendly(options));
}

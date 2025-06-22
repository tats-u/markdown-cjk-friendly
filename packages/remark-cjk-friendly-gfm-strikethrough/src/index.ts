import type { Root } from "mdast";
import {
  gfmStrikethroughCjkFriendly,
  type Options,
} from "micromark-extension-cjk-friendly-gfm-strikethrough";
import type { Processor } from "unified";

export type { Options };

/**
 * Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK)
 */
export default function remarkGfmStrikethroughCjkFriendly(
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

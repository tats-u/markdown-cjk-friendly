import parseOnly, { type Options } from "./parseOnly.ts";
import serializeOnly from "./serializeOnly.ts";

export type { Options };

/**
 * Make Markdown strikethrough (`~~`) in GFM more friendly with Chinese, Japanese, and Korean (CJK)
 *
 * This plugin supports both parsing and serializing. If you want to support only one of them, it is recommended to import this plugin from `remark-cjk-friendly-gfm-strikethrough/parseOnly` or `remark-cjk-friendly-gfm-strikethrough/serializeOnly` instead to minimize bundled dependencies.
 */
export default function remarkGfmStrikethroughCjkFriendly(
  this: unknown,
  options?: Options | null,
): void {
  parseOnly.call(this, options);
  serializeOnly.call(this);
}

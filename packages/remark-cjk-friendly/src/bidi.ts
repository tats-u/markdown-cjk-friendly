import parseOnly from "./parseOnly.ts";
import serializeOnly from "./serializeOnly.ts";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 *
 * This plugin supports both parsing and serializing. If you want to support only one of them, it is recommended to import this plugin from `remark-cjk-friendly/parseOnly` or `remark-cjk-friendly/serializeOnly` instead to minimize bundled dependencies.
 */
export default function remarkCjkFriendly(this: unknown): void {
  parseOnly.call(this);
  serializeOnly.call(this);
}

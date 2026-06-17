import remarkCjkFriendlyParseOnly from "./parseOnly.ts";
import remarkCjkFriendlySerializeOnly from "./serializeOnly.ts";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 *
 * This plugin supports both parsing and serializing. If you want to support only one of them, it is recommended to use {@linkcode remarkCjkFriendlyParseOnly} (`remark-cjk-friendly/parseOnly`) or {@linkcode remarkCjkFriendlySerializeOnly} (`remark-cjk-friendly/serializeOnly`) instead to minimize bundled dependencies.
 */
export default function remarkCjkFriendly(this: unknown): void {
  remarkCjkFriendlyParseOnly.call(this);
  remarkCjkFriendlySerializeOnly.call(this);
}

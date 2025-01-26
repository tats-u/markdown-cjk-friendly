import type { Extension } from "micromark-util-types";
import { codes } from "micromark-util-symbol";
import { attention } from "./ext/attention.js";

/**
 * Make Markdown emphasis (`**`) in CommonMark more friendly with Chinese, Japanese, and Korean (CJK).
 */
export function cjkFriendlyExtension(): Extension {
  return {
    text: {
      [codes.asterisk]: attention,
      [codes.underscore]: attention,
    },
    insideSpan: { null: [attention] },
  };
}

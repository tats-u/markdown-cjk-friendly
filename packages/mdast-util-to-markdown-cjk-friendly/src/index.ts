import type { Options } from "mdast-util-to-markdown";
import { defaultHandlers } from "mdast-util-to-markdown";
import {
  cjkFriendlyAttention,
  cjkFriendlyPhrasingHandlers,
} from "./phrasing.js";

/** Add CJK-friendly `toMarkdown` handlers for emphasis and strong. */
export function cjkFriendlyToMarkdown(): Options {
  return {
    handlers: {
      ...cjkFriendlyPhrasingHandlers,
      emphasis: cjkFriendlyAttention(defaultHandlers.emphasis),
      strong: cjkFriendlyAttention(defaultHandlers.strong),
    },
  };
}

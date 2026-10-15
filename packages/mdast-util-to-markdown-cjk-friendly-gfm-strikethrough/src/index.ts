import { gfmStrikethroughToMarkdown } from "mdast-util-gfm-strikethrough";
import type { Options } from "mdast-util-to-markdown";
import {
  cjkFriendlyAttention,
  cjkFriendlyPhrasingHandlers,
} from "mdast-util-to-markdown-cjk-friendly/phrasing";

/** Add CJK-friendly GFM strikethrough serialization. */
export function cjkFriendlyGfmStrikethroughToMarkdown(): Options {
  const extension = gfmStrikethroughToMarkdown();
  const handleDelete = extension.handlers?.delete;
  if (!handleDelete) {
    throw new Error("Expected the GFM strikethrough handler");
  }
  return {
    ...extension,
    handlers: {
      ...cjkFriendlyPhrasingHandlers,
      delete: cjkFriendlyAttention(handleDelete),
    },
  };
}

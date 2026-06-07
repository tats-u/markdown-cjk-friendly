import type { Paragraph, PhrasingContent, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { cjkFriendlyToMarkdown } from "mdast-util-to-markdown-cjk-friendly";

const markers = {
  strong: "**",
  emphasis: "*",
};

function stripPosition<T>(node: T): Omit<T, "position"> {
  if (typeof node !== "object" || node === null) {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(stripPosition) as unknown as Omit<T, "position">;
  }
  if (!("position" in node)) {
    if ("children" in node) {
      return {
        ...node,
        children: stripPosition(node.children),
      } as Omit<T, "position">;
    }
    return node;
  }
  const { position, ...rest } = node;
  return stripPosition(rest) as Omit<T, "position">;
}

function codePointToEscaped(codePoint: number): string {
  return `&#x${codePoint.toString(16).toUpperCase()};`;
}

function escapeFirstChar(str: string): string {
  if (str.length === 0) {
    return str;
  }
  // biome-ignore lint/style/noNonNullAssertion: 100% exists
  const first = str.codePointAt(0)!;
  return codePointToEscaped(first) + str.slice(first > 0xffff ? 2 : 1);
}

function escapeFirstCharIf(str: string, shouldEscape: boolean): string {
  return shouldEscape ? escapeFirstChar(str) : str;
}

function escapeLastChar(str: string): string {
  if (str.length === 0) {
    return str;
  }
  const lastCodeUnit = str.charCodeAt(str.length - 1);
  if (str.length === 1 || lastCodeUnit < 0xdc00 || lastCodeUnit > 0xdfff) {
    // Not a surrogate pair
    return str.slice(0, -1) + codePointToEscaped(lastCodeUnit);
  }

  // Surrogate pair?
  // biome-ignore lint/style/noNonNullAssertion: border check passed
  const codePoint = str.codePointAt(str.length - 2)!;
  if (codePoint > 0xffff) {
    return str.slice(0, -2) + codePointToEscaped(codePoint);
  }

  // Not a valid surrogate pair, just escape the last code unit
  return str.slice(0, -1) + codePointToEscaped(lastCodeUnit);
}

function escapeLastCharIf(str: string, shouldEscape: boolean): string {
  return shouldEscape ? escapeLastChar(str) : str;
}

function fromInlineMarkdown(markdown: string | null): PhrasingContent[] {
  if (!markdown) {
    return [];
  }
  const root = fromMarkdown(markdown);
  return stripPosition(
    (root.children[0] as Paragraph).children,
  ) as PhrasingContent[];
}

describe("cjkFriendlyToMarkdown", () => {
  const srcList: [string | null, boolean, string, boolean, string | null][] = [
    ["漢", true, "()", true, "字"],
    ["A", true, "「」", true, "B"],
    ["A", true, "（）", true, "B"],
    ["葛\u{E0100}", true, "()", true, "字"],
    ["𩸽", true, "()", true, "字"],
    ["字", true, "()", true, "𩸽"],
    ["塚\u{FE00}", true, "()", true, "字"],
    ["㊙\u{FE0E}", true, "()", true, "字"],
    ["字", true, "()", true, "㊙\u{FE0E}"],
    ["漢", true, "`code`", true, "字"],
    ["漢", true, "[link](http://example.com)", true, "字"],
    ["字", true, "“\u{FE01}”\u{FE01}", true, "B"],
    ["字", true, "‘\u{FE01}’\u{FE01}", true, "B"],
    ["A", true, "。\u{FE00}", true, "B"],
    ["A", false, "()", false, "B"],
    ["字", true, "()", false, "B"],
    ["A", false, "()", true, "字"],
    ["A", false, "()", false, "\u{E0100}"],
    ["", true, "()", false, "B"],
    ["A", false, "()", true, ""],
    ["", true, "()", true, ""],
    ["A\u{A0}", true, "()", true, "\u{A0}B"],
    ["A", false, "“”", false, "B"],
    ["A", false, "‘’", false, "B"],
    ["A", false, "“\u{FE00}”\u{FE00}", false, "B"],
    ["A", false, "‘\u{FE00}’\u{FE00}", false, "B"],
  ];

  it.each(
    srcList.flatMap(([before, canOpen, content, canClose, after]) =>
      Object.entries(markers).map(([type, marker]) => ({
        before,
        canOpen,
        content,
        canClose,
        after,
        type,
        marker,
      })),
    ),
  )("Handles surrounding characters around $type ($before + $marker + $content + $marker + $after) (canOpen: $canOpen, canClose: $canClose)", ({
    before,
    canOpen,
    content,
    canClose,
    after,
    type,
    marker,
  }) => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            ...fromInlineMarkdown(before),
            {
              type: type as keyof typeof markers,
              children: fromInlineMarkdown(content),
            },
            ...fromInlineMarkdown(after),
          ],
        },
      ],
    };

    // Note: toMarkdown(fromMarkdown("_A_")) === "*A*\n". You don't need to convert `*` to `_` if `_` can be used as the marker, but you do need to convert `*` to `_` even if `_` also can be used as the marker.
    expect(
      toMarkdown(tree, {
        extensions: [cjkFriendlyToMarkdown()],
      }),
    ).toBe(
      `${escapeLastCharIf(before ?? "", !canOpen)}${marker}${content}${marker}${escapeFirstCharIf(after ?? "", !canClose)}\n`,
    );
  });
});

import type { PhrasingContent, Root } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { cjkFriendlyToMarkdown } from "mdast-util-to-markdown-cjk-friendly";

const attention = [
  { type: "emphasis", marker: "*" },
  { type: "emphasis", marker: "_" },
  { type: "strong", marker: "**" },
  { type: "strong", marker: "__" },
] as const;

function text(value: string): PhrasingContent {
  return { type: "text", value };
}

function root(children: PhrasingContent[]): Root {
  return { type: "root", children: [{ type: "paragraph", children }] };
}

function withoutPositions(node: unknown): unknown {
  return JSON.parse(
    JSON.stringify(node, (key, value) =>
      key === "position" ? undefined : value,
    ),
  );
}

describe.each(attention)("character references around $type ($marker)", ({
  type,
  marker,
}) => {
  const options = {
    emphasis: marker[0] as "*" | "_",
    strong: marker[0] as "*" | "_",
    extensions: [cjkFriendlyToMarkdown()],
  };

  it.each(
    [" ", "\t", "\u00a0"].flatMap((character) =>
      [0, 1, 2, 3, 4].map((backslashes) => ({ character, backslashes })),
    ),
  )("preserves $backslashes backslashes before encoded whitespace $character", ({
    character,
    backslashes,
  }) => {
    const tree = root([
      { type, children: [text("\\".repeat(backslashes) + character)] },
    ]);
    const original = structuredClone(tree);
    const markdown = toMarkdown(tree, options);
    const reference = `&#x${character.codePointAt(0)?.toString(16).toUpperCase()};`;

    expect(markdown).toBe(
      `${marker}${"\\".repeat(backslashes * 2)}${reference}${marker}\n`,
    );
    expect(withoutPositions(fromMarkdown(markdown))).toEqual(tree);
    expect(tree).toEqual(original);
  });

  it.each(
    ["a", "𐐀", "𝑎"].flatMap((character) =>
      [0, 1, 2, 3, 4].map((backslashes) => ({ character, backslashes })),
    ),
  )("preserves $backslashes backslashes before encoded outside character $character", ({
    character,
    backslashes,
  }) => {
    const tree = root([
      text("\\".repeat(backslashes) + character),
      { type, children: [text(".b")] },
    ]);
    const markdown = toMarkdown(tree, options);
    const reference = `&#x${character.codePointAt(0)?.toString(16).toUpperCase()};`;

    expect(markdown).toBe(
      `${"\\".repeat(backslashes * 2)}${reference}${marker}.b${marker}\n`,
    );
    expect(withoutPositions(fromMarkdown(markdown))).toEqual(tree);
  });

  it.each([
    "a",
    "𐐀",
    "𝑎",
  ])("encodes a complete code point after a closer: %s", (character) => {
    const tree = root([{ type, children: [text("b.")] }, text(character)]);
    const markdown = toMarkdown(tree, options);
    const reference = `&#x${character.codePointAt(0)?.toString(16).toUpperCase()};`;

    expect(markdown).toBe(`${marker}b.${marker}${reference}\n`);
    expect(withoutPositions(fromMarkdown(markdown))).toEqual(tree);
  });

  it("preserves supplementary characters encoded inside underscore attention", () => {
    const tree = root([text("a"), { type, children: [text("𐐀𐐁")] }, text("b")]);
    const markdown = toMarkdown(tree, options);

    expect(markdown).toBe(
      marker[0] === "_"
        ? `&#x61;${marker}&#x10400;&#x10401;${marker}&#x62;\n`
        : `a${marker}𐐀𐐁${marker}b\n`,
    );
    expect(withoutPositions(fromMarkdown(markdown))).toEqual(tree);
  });

  it("keeps earlier escapes intact when encoding a trailing space", () => {
    const tree = root([{ type, children: [text("a\\b*\\ ")] }]);
    const markdown = toMarkdown(tree, options);

    expect(markdown).toBe(`${marker}a\\b\\*\\\\&#x20;${marker}\n`);
    expect(withoutPositions(fromMarkdown(markdown))).toEqual(tree);
  });
});

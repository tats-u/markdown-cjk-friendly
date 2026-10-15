import type { Root } from "mdast";
import { remark } from "remark";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
import remarkCjkFriendlyGfmStrikethroughSerializeOnly from "remark-cjk-friendly-gfm-strikethrough/serializeOnly";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendlyGfmStrikethrough);

function withoutPositions(node: unknown): unknown {
  return JSON.parse(
    JSON.stringify(node, (key, value) =>
      key === "position" ? undefined : value,
    ),
  );
}

describe("remark-cjk-friendly-gfm-strikethrough stringify", () => {
  it.each([
    false,
    true,
  ])("preserves adjacent and nested attention (strikethrough first: %s)", (strikethroughFirst) => {
    const processor = remark().use(remarkGfm);
    if (strikethroughFirst) {
      processor.use(remarkCjkFriendlyGfmStrikethrough).use(remarkCjkFriendly);
    } else {
      processor.use(remarkCjkFriendly).use(remarkCjkFriendlyGfmStrikethrough);
    }
    const text = (value: string) => ({ type: "text" as const, value });
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "emphasis", children: [text("a")] },
            { type: "emphasis", children: [text("b")] },
            text(" 漢"),
            {
              type: "delete",
              children: [{ type: "strong", children: [text("()")] }],
            },
            text("字 "),
            { type: "delete", children: [text("c")] },
            text(" "),
            { type: "delete", children: [text("d")] },
          ],
        },
      ],
    };
    const original = structuredClone(tree);
    const markdown = processor.stringify(tree);
    const parsed = processor.parse(markdown) as Root;
    expect(parsed.children[0]).toMatchObject(tree.children[0]);
    expect(tree).toEqual(original);
    expect(markdown).toContain("漢~~**()**~~字");
  });

  it("preserves table-cell attention", () => {
    const processor = remark()
      .use(remarkGfm)
      .use(remarkCjkFriendlyGfmStrikethrough)
      .use(remarkCjkFriendly);
    const source = "| a |\n| - |\n| 漢~~**()**~~字 |\n";
    const tree = processor.parse(source);
    const markdown = processor.stringify(tree);
    expect(markdown).toContain("漢~~**()**~~字");
    expect(withoutPositions(processor.parse(markdown))).toEqual(
      withoutPositions(tree),
    );
  });

  it("keeps standard emphasis rules when only strikethrough is enabled", () => {
    const tree = remark().parse("漢**()**字\n\n*a*_b_");
    const plain = remark().stringify(tree);
    const markdown = remark()
      .use(remarkCjkFriendlyGfmStrikethrough)
      .stringify(tree);
    expect(markdown).toBe(plain);
  });

  it("serializes delete nodes as raw ~~ markers", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "漢" },
            { type: "delete", children: [{ type: "text", value: "()" }] },
            { type: "text", value: "字" },
          ],
        },
      ],
    };

    const markdown = remark()
      .use(remarkCjkFriendlyGfmStrikethrough)
      .stringify(tree);
    const parsed = parser.parse(markdown) as Root;

    expect(markdown).toBe("漢~~()~~字\n");
    expect(markdown).not.toContain("&#x");
    expect(parsed.children[0]).toMatchObject(tree.children[0]);
  });
});

describe("remark-cjk-friendly-gfm-strikethrough/serializeOnly", () => {
  it("serializes delete nodes as raw ~~ markers", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "漢" },
            { type: "delete", children: [{ type: "text", value: "()" }] },
            { type: "text", value: "字" },
          ],
        },
      ],
    };

    const markdown = remark()
      .use(remarkCjkFriendlyGfmStrikethroughSerializeOnly)
      .stringify(tree);

    // serializeOnly is not suitable for parsing, so use bidirectional plugin instead here
    const parsed = parser.parse(markdown) as Root;

    expect(markdown).toBe("漢~~()~~字\n");
    expect(markdown).not.toContain("&#x");
    expect(parsed.children[0]).toMatchObject(tree.children[0]);
  });
});

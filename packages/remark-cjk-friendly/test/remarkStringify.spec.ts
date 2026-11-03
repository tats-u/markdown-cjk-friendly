import type { PhrasingContent, Root } from "mdast";
import { remark } from "remark";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlySerializeOnly from "remark-cjk-friendly/serializeOnly";
import remarkParse from "remark-parse";
import { unified } from "unified";

const parser = unified().use(remarkParse).use(remarkCjkFriendly);

describe("remark-cjk-friendly stringify", () => {
  it.each([
    remarkCjkFriendly,
    remarkCjkFriendlySerializeOnly,
  ])("round-trips backslashes before character references with %s", (plugin) => {
    const children: PhrasingContent[][] = (
      ["emphasis", "strong"] as const
    ).flatMap((type) => [
      ...["\\ ", "\\\t", "\\\\ "].map((value): PhrasingContent[] => [
        { type: "text", value: "𩸽" },
        { type, children: [{ type: "text", value }] },
        { type: "text", value: "𠮷" },
      ]),
      [
        { type: "text", value: "\\𐐀" },
        { type, children: [{ type: "text", value: ".b" }] },
      ] as PhrasingContent[],
    ]);
    const tree: Root = {
      type: "root",
      children: children.map((children) => ({ type: "paragraph", children })),
    };
    const markdown = remark().use(plugin).stringify(tree);

    expect(parser.parse(markdown)).toMatchObject(tree);
  });

  it("keeps surrounding CJK characters raw around strong markers", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "漢" },
            { type: "strong", children: [{ type: "text", value: "()" }] },
            { type: "text", value: "字" },
          ],
        },
      ],
    };

    const markdown = remark().use(remarkCjkFriendly).stringify(tree);
    const parsed = parser.parse(markdown) as Root;

    expect(markdown).toBe("漢**()**字\n");
    expect(markdown).not.toContain("&#x");
    expect(parsed.children[0]).toMatchObject(tree.children[0]);
  });
});

describe("remark-cjk-friendly/serializeOnly", () => {
  it("keeps surrounding CJK characters raw around strong markers", () => {
    const tree: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "漢" },
            { type: "strong", children: [{ type: "text", value: "()" }] },
            { type: "text", value: "字" },
          ],
        },
      ],
    };

    const markdown = remark()
      .use(remarkCjkFriendlySerializeOnly)
      .stringify(tree);

    // serializeOnly is not suitable for parsing, so use bidirectional plugin instead here
    const parsed = parser.parse(markdown) as Root;

    expect(markdown).toBe("漢**()**字\n");
    expect(markdown).not.toContain("&#x");
    expect(parsed.children[0]).toMatchObject(tree.children[0]);
  });
});

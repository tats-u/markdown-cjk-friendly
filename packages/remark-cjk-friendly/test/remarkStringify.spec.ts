import type { Root } from "mdast";
import { remark } from "remark";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkParse from "remark-parse";
import { unified } from "unified";

const parser = unified().use(remarkParse).use(remarkCjkFriendly);

describe("remark-cjk-friendly stringify", () => {
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

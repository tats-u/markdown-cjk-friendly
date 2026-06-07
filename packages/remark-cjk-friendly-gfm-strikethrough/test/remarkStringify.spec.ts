import type { Root } from "mdast";
import { remark } from "remark";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendlyGfmStrikethrough);

describe("remark-cjk-friendly-gfm-strikethrough stringify", () => {
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

import { readFile } from "node:fs/promises";
import { compile as compileMdx } from "@mdx-js/mdx";
import rehypeStringify from "rehype-stringify";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processorOriginal = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendly)
  .use(remarkCjkFriendlyGfmStrikethrough)
  .use(remarkRehype)
  .use(rehypeStringify);

async function md2Html(md: string): Promise<string> {
  const result = await processor.process(md);
  return result.toString();
}

async function md2HtmlNonCjk(md: string): Promise<string> {
  const result = await processorOriginal.process(md);
  return result.toString();
}

async function mdx2React(md: string): Promise<string> {
  const result = await compileMdx(md, {
    remarkPlugins: [
      remarkGfm,
      remarkCjkFriendly,
      remarkCjkFriendlyGfmStrikethrough,
    ],
  });
  return result.toString();
}

async function mdx2ReactNonCjk(md: string): Promise<string> {
  const result = await compileMdx(md, {
    remarkPlugins: [remarkGfm],
  });
  return result.toString();
}

describe("remark-cjk-friendly-gfm-strikethrough", () => {
  it("Compatible with CJK", async () => {
    const result = await md2Html(
      await readFile(
        new URL("../../../testcases/gfm-strikethrough.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/~~[^\n]+~~/);
    }
    expect(result).toMatchSnapshot();
  });

  it("Generates the same output for non-CJK GFM", async () => {
    const source = await readFile(
      new URL("../../../testcases/gfm-non-cjk.md", import.meta.url),
      "utf-8",
    );
    const result = await md2Html(source);
    expect(result).toContain("<table");
    expect(result).toContain("<del>");
    expect(result).toEqual(await md2HtmlNonCjk(source));
  });

  it("Compatible with CJK (MDX)", async () => {
    const source = await readFile(
      new URL("../../../testcases/gfm-strikethrough.md", import.meta.url),
      "utf-8",
    );
    const result = await mdx2React(source);
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/~~[^\n]+~~/);
    }
    expect(result).toMatchSnapshot();
  });

  it("Generates the same output for non-CJK GFM (MDX)", async () => {
    const source = await readFile(
      new URL("../../../testcases/gfm-non-cjk.md", import.meta.url),
      "utf-8",
    );
    const result = await mdx2React(source);
    expect(result).toContain("components.table,");
    expect(result).toContain("components.del,");
    expect(result).toEqual(await mdx2ReactNonCjk(source));
  });
});

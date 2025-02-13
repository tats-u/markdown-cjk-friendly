import { readFile } from "node:fs/promises";
import { compile as compileMdx } from "@mdx-js/mdx";
import rehypeStringify from "rehype-stringify";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

const processor = unified()
  .use(remarkParse)
  .use(remarkCjkFriendly)
  .use(remarkRehype)
  .use(rehypeStringify);

const processorOriginal = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify);

const processorWithGfm = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendly)
  .use(remarkRehype)
  .use(rehypeStringify);

const processorWithGfm2 = unified()
  .use(remarkParse)
  .use(remarkCjkFriendly)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

async function md2Html(md: string): Promise<string> {
  const result = await processor.process(md);
  return result.toString();
}

async function md2HtmlOriginal(md: string): Promise<string> {
  const result = await processorOriginal.process(md);
  return result.toString();
}

async function mdx2React(md: string): Promise<string> {
  const result = await compileMdx(md, {
    remarkPlugins: [remarkGfm, remarkCjkFriendly],
  });
  return result.toString();
}

async function mdx2ReactNonCjk(md: string): Promise<string> {
  const result = await compileMdx(md, {
    remarkPlugins: [remarkGfm],
  });
  return result.toString();
}

async function gfm2Html(md: string): Promise<string> {
  const result = await processorWithGfm.process(md);
  return result.toString();
}

async function gfm2Html2(md: string): Promise<string> {
  const result = await processorWithGfm2.process(md);
  return result.toString();
}

describe("remark-cjk-friendly", () => {
  it("** around Kana/Han is converted to <strong>", async () => {
    const result = await md2Html(
      await readFile(
        new URL("../../../testcases/strong.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("** around Korean is converted to <strong>", async () => {
    const result = await md2Html(
      await readFile(
        new URL("../../../testcases/korean.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("** around pseudo-emoji (CJK symbols that are also unqualified-emoji) is converted to <strong>", async () => {
    const result = await md2Html(
      await readFile(
        new URL("../../../testcases/pseudo-emoji.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("recognizes non-BMP punctuation and symbols", async () => {
    const result = await md2Html(
      await readFile(
        new URL("../../../testcases/non-bmp.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toContain("<strong>");
    }
    expect(result).toMatchSnapshot();
  });

  it("process underscores around CJK punctuation", async () => {
    const result = await md2Html(
      await readFile(
        new URL("../../../testcases/underscore-cjk-punct.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toContain("_");
    }
    expect(result).toMatchSnapshot();
  });

  it("Example Markdown in README", async () => {
    const readme = await readFile(
      new URL("../README.md", import.meta.url),
      "utf-8",
    );
    const markdownRegexResult = /```md((?:.(?!```))+)/s.exec(readme);
    if (!markdownRegexResult) {
      throw new Error("Failed to find example Markdown in README");
    }
    const result = await md2Html(markdownRegexResult[1]);
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("Output for CommonMark test cases are the same as those without this plugin", async () => {
    for (const testCase of commonMarkTestCases) {
      expect(await md2Html(testCase.markdown)).toBe(
        await md2HtmlOriginal(testCase.markdown),
      );
    }
  });

  it("Compatible with remark-gfm (1)", async () => {
    // Note: GFM strikethrough is not fixed by this extension
    const result = await gfm2Html("あ**()**あ[^1]\n\n[^1]: ~~あ~~");
    expect(result).not.toMatch(/\*\*[^\n]+\*\*/);
    expect(result).not.toContain("~~");
    expect(result).toMatchSnapshot();
  });

  it("Compatible with remark-gfm (2)", async () => {
    // Note: GFM strikethrough is not fixed by this extension
    const result = await gfm2Html2("あ**()**あ[^1]\n\n[^1]: ~~あ~~");
    expect(result).not.toMatch(/\*\*[^\n]+\*\*/);
    expect(result).not.toContain("~~");
    expect(result).toMatchSnapshot();
  });

  it("** around Kana/Han is converted to <strong> (MDX)", async () => {
    const result = await mdx2React(
      await readFile(
        new URL("../../../testcases/strong.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("** around Korean is converted to <strong> (MDX)", async () => {
    const result = await mdx2React(
      await readFile(
        new URL("../../../testcases/korean.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("** around pseudo-emoji (CJK symbols that are also unqualified-emoji) is converted to <strong> (MDX)", async () => {
    const result = await mdx2React(
      await readFile(
        new URL("../../../testcases/pseudo-emoji.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("recognizes non-BMP punctuation and symbols (MDX)", async () => {
    const result = await mdx2React(
      await readFile(
        new URL("../../../testcases/non-bmp.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toContain(".strong,");
    }
    expect(result).toMatchSnapshot();
  });

  it("process underscores around CJK punctuation (MDX)", async () => {
    const result = await mdx2React(
      await readFile(
        new URL("../../../testcases/underscore-cjk-punct.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toContain("__");
    }
    expect(result).toMatchSnapshot();
  });
});

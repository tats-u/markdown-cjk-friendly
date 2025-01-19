import { readFile } from "node:fs/promises";
import MarkdownIt from "markdown-it";
import markdownItCjkFriendly from "markdown-it-cjk-friendly";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

const md = MarkdownIt();
md.use(markdownItCjkFriendly);

describe("markdown-it-cjk-friendly", () => {
  it("** around Kana/Han is converted to <strong>", async () => {
    const result = md.render(
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
    const result = md.render(
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
    const result = md.render(
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
    const result = md.render(
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
    const result = md.render(
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
    const result = md.render(markdownRegexResult[1]);
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("Don't conflict with existing CommonMark test cases", async () => {
    for (const testCase of commonMarkTestCases) {
      if (testCase.section !== "Emphasis and strong emphasis") continue;
      // markdown-it is not incompatible with test cases containing raw HTML tags
      if (/<[a-z]+ [^>]+=[^>]+>/.test(testCase.markdown)) continue;
      const result = md.render(testCase.markdown);
      expect(result).toBe(testCase.html);
    }
  });
});

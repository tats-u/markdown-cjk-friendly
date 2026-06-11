import { readFile } from "node:fs/promises";
import MarkdownIt from "markdown-it";
import markdownItCjkFriendly from "markdown-it-cjk-friendly";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

const md = new MarkdownIt();
md.use(markdownItCjkFriendly);

const mdOriginal = new MarkdownIt();

function md2Html(input: string): string {
  return md.render(input);
}

function md2HtmlOriginal(input: string): string {
  return mdOriginal.render(input);
}

describe("markdown-it-cjk-friendly", () => {
  it("** around Kana/Han is converted to <strong>", async () => {
    const result = md2Html(
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
    const result = md2Html(
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
    const result = md2Html(
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

  it("** around pseudo-emoji (CJK symbols that are also unqualified-emoji) is converted to <strong>", async () => {
    const result = md2Html(
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

  it("** around CJK text presentation sequences is converted to <strong>", async () => {
    const result = md2Html(
      await readFile(
        new URL(
          "../../../testcases/text-presentation-sequence.md",
          import.meta.url,
        ),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("** around emoji presentation sequences is not converted to <strong>", async () => {
    const result = md2Html(
      await readFile(
        new URL(
          "../../../testcases/emoji-presentation-sequence.md",
          import.meta.url,
        ),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).toMatch(/^$|\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("** around default emoji presentation character is not converted to <strong> (unless followed by text variation selector)", async () => {
    const result = md2Html(
      await readFile(
        new URL(
          "../../../testcases/emoji-default-presentation.md",
          import.meta.url,
        ),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).toMatch(/^$|\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("recognizes non-BMP punctuation and symbols", async () => {
    const result = md2Html(
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
    const result = md2Html(
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
    const result = md2Html(markdownRegexResult[1]);
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
    }
    expect(result).toMatchSnapshot();
  });

  it("Output for CommonMark test cases are the same as those without this plugin", async () => {
    for (const testCase of commonMarkTestCases) {
      expect(md2Html(testCase.markdown)).toBe(
        md2HtmlOriginal(testCase.markdown),
      );
    }
  });
});

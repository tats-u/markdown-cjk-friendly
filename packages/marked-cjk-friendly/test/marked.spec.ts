import { readFile } from "node:fs/promises";
import { Marked } from "marked";
import markedCjkFriendly from "marked-cjk-friendly";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

function createMarked(): Marked {
  return new Marked(markedCjkFriendly());
}

function md2Html(input: string): string {
  return createMarked().parse(input) as string;
}

function md2HtmlOriginal(input: string): string {
  return new Marked().parse(input) as string;
}

describe("marked-cjk-friendly", () => {
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

  it("~~ around CJK is converted to <del>", async () => {
    const result = md2Html(
      await readFile(
        new URL("../../../testcases/gfm-strikethrough.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/~~[^\n]+~~/);
    }
    expect(result).toContain("<del>");
    expect(result).toMatchSnapshot();
  });

  it("Output for non-CJK GFM strikethrough is the same as without this plugin", async () => {
    const source = await readFile(
      new URL("../../../testcases/gfm-non-cjk.md", import.meta.url),
      "utf-8",
    );
    const result = md2Html(source);
    expect(result).toContain("<del>");
    expect(result).toEqual(md2HtmlOriginal(source));
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

  it("keeps CommonMark emphasis decisions intact with marked 18's emStrongLDelim group layout", () => {
    const cases: [string, string][] = [
      ["a*b*c", "<p>a<em>b</em>c</p>\n"],
      ["5*6*78", "<p>5<em>6</em>78</p>\n"],
      ["foo*bar*", "<p>foo<em>bar</em></p>\n"],
      ["a * foo bar*", "<p>a * foo bar*</p>\n"],
      ["foo_bar_", "<p>foo_bar_</p>\n"],
      ["_foo bar_", "<p><em>foo bar</em></p>\n"],
      ["5_6_78", "<p>5_6_78</p>\n"],
    ];
    for (const [input, expected] of cases) {
      expect(md2Html(input)).toBe(expected);
      expect(md2Html(input)).toBe(md2HtmlOriginal(input));
    }
  });

  it("Output for CommonMark test cases are the same as those without this plugin", async () => {
    for (const testCase of commonMarkTestCases) {
      expect(md2Html(testCase.markdown)).toBe(
        md2HtmlOriginal(testCase.markdown),
      );
    }
  });
});

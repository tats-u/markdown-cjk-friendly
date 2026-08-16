import { readFile } from "node:fs/promises";
import { Marked } from "marked";
import markedCjkFriendly from "marked-cjk-friendly";
import { Marked as Marked17 } from "marked17";
import { Marked as Marked17_0_4 } from "marked17-0-4";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

type MarkedObject = Marked | Marked17 | Marked17_0_4;
type MarkedClass = typeof Marked | typeof Marked17 | typeof Marked17_0_4;

class MarkedHtmlConverter {
  private marked: MarkedObject;
  private originalMarked: MarkedObject;

  constructor(Marked_: MarkedClass) {
    this.marked = new (Marked_ as unknown as typeof Marked)(
      markedCjkFriendly(),
    ) as unknown as MarkedObject;
    this.originalMarked = new Marked_() as unknown as MarkedObject;
  }

  md2Html(input: string): string {
    return (this.marked.parse as (src: string) => string)(input);
  }

  md2HtmlOriginal(input: string): string {
    return (this.originalMarked.parse as (src: string) => string)(input);
  }
}

const htmlConverters = [
  {
    version: "18",
    converter: new MarkedHtmlConverter(Marked),
  },
  {
    version: "17",
    converter: new MarkedHtmlConverter(Marked17),
  },
  {
    version: "17.0.4",
    converter: new MarkedHtmlConverter(Marked17_0_4),
  },
] as const;

describe.each(htmlConverters)("marked-cjk-friendly (marked $version)", ({
  converter,
}) => {
  const md2Html = (input: string) => converter.md2Html(input);
  const md2HtmlOriginal = (input: string) => converter.md2HtmlOriginal(input);

  it.concurrent("** around Kana/Han is converted to <strong>", async ({
    expect,
  }) => {
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

  it.concurrent("** around Korean is converted to <strong>", async ({
    expect,
  }) => {
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

  it.concurrent("** around pseudo-emoji (CJK symbols that are also unqualified-emoji) is converted to <strong>", async ({
    expect,
  }) => {
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

  it.concurrent("recognizes non-BMP punctuation and symbols", async ({
    expect,
  }) => {
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

  it.concurrent("process underscores around CJK punctuation", async ({
    expect,
  }) => {
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

  it.concurrent("~~ around CJK is converted to <del>", async ({ expect }) => {
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

  it.concurrent("Output for non-CJK GFM strikethrough is the same as without this plugin", async ({
    expect,
  }) => {
    const source = await readFile(
      new URL("../../../testcases/gfm-non-cjk.md", import.meta.url),
      "utf-8",
    );
    const result = md2Html(source);
    expect(result).toContain("<del>");
    expect(result).toEqual(md2HtmlOriginal(source));
  });

  it.concurrent("Example Markdown in README", async ({ expect }) => {
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

  it.concurrent.for(
    commonMarkTestCases,
  )("Output for CommonMark test case (example $example in section $section) is the same as those without this plugin", async (testCase, {
    expect,
  }) => {
    expect(
      md2Html(testCase.markdown),
      `Different result. Markdown: ${testCase.markdown}`,
    ).toBe(md2HtmlOriginal(testCase.markdown));
  });
});

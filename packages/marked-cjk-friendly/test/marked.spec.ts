import { readFile } from "node:fs/promises";
import { Marked } from "marked";
import markedCjkFriendly from "marked-cjk-friendly";
import { Marked as Marked17 } from "marked17";
import { Marked as Marked17_0_1 } from "marked17-0-1";
import { Marked as Marked17_0_2 } from "marked17-0-2";
import { Marked as Marked17_0_4 } from "marked17-0-4";
import { Marked as Marked18_1 } from "marked18-1";
import { Marked as Marked18_1_1 } from "marked18-1-1";
import { Marked as Marked18_1_2 } from "marked18-1-2";
import { Marked as Marked18_2_0 } from "marked18-2-0";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

type MarkedClass =
  | typeof Marked
  | typeof Marked17
  | typeof Marked17_0_4
  | typeof Marked17_0_1
  | typeof Marked17_0_2
  | typeof Marked18_1_1
  | typeof Marked18_1_2
  | typeof Marked18_2_0
  | typeof Marked18_1;
type MarkedObject = InstanceType<MarkedClass>;

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

  it.each([
    ["**강조 **는", "**강조 **는"],
    ["***코드 ***를", "***코드 ***를"],
    ["*참고 **주의:** 내용*", "<em>참고 <strong>주의:</strong> 내용</em>"],
    ["*注意 **重要:** 内容*", "<em>注意 <strong>重要:</strong> 内容</em>"],
    ["***API* *설정* 값**", "<strong><em>API</em> <em>설정</em> 값</strong>"],
    ["월 __회 × __분", "월 __회 × __분"],
    ["a/_원문/x 와 b/_원문/y", "a/_원문/x 와 b/_원문/y"],
    ["**코드(code)**를", "<strong>코드(code)</strong>를"],
    ["*強調　*𠮷", "*強調　*𠮷"],
    ["*a日**", "<em>a日</em>*"],
    ["~~강조 ~~는", "~~강조 ~~는"],
  ])("resolves CJK-adjacent delimiters in %s", (markdown, html) => {
    expect(md2Html(markdown)).toBe(`<p>${html}</p>\n`);
  });

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

it.each([
  { version: "17.0.1", converter: new MarkedHtmlConverter(Marked17_0_1) },
  { version: "17.0.2", converter: new MarkedHtmlConverter(Marked17_0_2) },
])("parses CJK strikethrough with marked $version", ({ converter }) => {
  expect(converter.md2Html("漢~~「字」~~漢")).toBe(
    "<p>漢<del>「字」</del>漢</p>\n",
  );
});

describe.each([
  ...htmlConverters,
  { version: "18.1.1", converter: new MarkedHtmlConverter(Marked18_1_1) },
  { version: "18.1.2", converter: new MarkedHtmlConverter(Marked18_1_2) },
  { version: "18.2.0", converter: new MarkedHtmlConverter(Marked18_2_0) },
  { version: "18.1", converter: new MarkedHtmlConverter(Marked18_1) },
])("marked $version delimiter regressions", ({ converter }) => {
  it.each([
    "a*b**",
    "*_#_",
    "前文 a*b** 後文",
    "前文 *_#_ 後文",
  ])("preserves native emphasis for non-CJK delimiter runs in %s", (source) => {
    expect(converter.md2Html(source)).toBe(converter.md2HtmlOriginal(source));
  });
});

import { readFile } from "node:fs/promises";
import { micromark } from "micromark";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

const extensions = [cjkFriendlyExtension()];
const gfmExtension = gfm();
const withGfm = [gfmExtension, ...extensions];
const withGfm2 = [...extensions, gfmExtension];
const withGfmHtml = [gfmHtml()];

function md2Html(md: string): string {
  return micromark(md, { extensions });
}

function gfm2Html(md: string): string {
  return micromark(md, { extensions: withGfm, htmlExtensions: withGfmHtml });
}

function gfm2Html2(md: string): string {
  return micromark(md, { extensions: withGfm2, htmlExtensions: withGfmHtml });
}

function md2HtmlOriginal(md: string): string {
  return micromark(md);
}

describe("micromark-extensions-cjk-friendly", () => {
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

  it("Compatible with GFM extension (1)", async () => {
    // Note: GFM strikethrough is not fixed by this extension
    const result = gfm2Html("あ**()**あ[^1]\n\n[^1]: ~~あ~~");
    expect(result).not.toMatch(/\*\*[^\n]+\*\*/);
    expect(result).not.toContain("~~");
    expect(result).toMatchSnapshot();
  });

  it("Compatible with GFM extension (2)", async () => {
    // Note: GFM strikethrough is not fixed by this extension
    const result = gfm2Html2("あ**()**あ[^1]\n\n[^1]: ~~あ~~");
    expect(result).not.toMatch(/\*\*[^\n]+\*\*/);
    expect(result).not.toContain("~~");
    expect(result).toMatchSnapshot();
  });
});

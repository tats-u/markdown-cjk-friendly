import { readFile } from "node:fs/promises";
import MarkdownIt from "markdown-it";
import markdownItCjkFriendly from "markdown-it-cjk-friendly";
import { bench } from "vitest";
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

describe("markdown-it CJK text bench", async () => {
  const strongTestText = await readFile(
    new URL("../../../testcases/strong.md", import.meta.url),
    "utf-8",
  );

  const nonBmpTestText = await readFile(
    new URL("../../../testcases/non-bmp.md", import.meta.url),
    "utf-8",
  );

  const koreanTestText = await readFile(
    new URL("../../../testcases/korean.md", import.meta.url),
    "utf-8",
  );

  const underscoreCjkTestText = await readFile(
    new URL("../../../testcases/underscore-cjk-punct.md", import.meta.url),
    "utf-8",
  );

  const readmeText = await readFile(
    new URL("../README.md", import.meta.url),
    "utf-8",
  );

  const testText = [
    strongTestText,
    nonBmpTestText,
    koreanTestText,
    underscoreCjkTestText,
    readmeText,
  ].join("\n\n");

  bench("CJK text with extension", () => {
    md2Html(testText);
  });

  bench("CJK text withOUT extension", () => {
    md2HtmlOriginal(testText);
  });
});

describe("markdown-it CommonMark testcase bench", () => {
  const commonMarkTestCasesText = commonMarkTestCases
    .filter((testCase) => /[*_]/.test(testCase.markdown))
    .map((testCase) => testCase.markdown)
    .join("\n\n");

  bench("CommonMark testcases with extension", () => {
    md2Html(commonMarkTestCasesText);
  });

  bench("CommonMark testcases withOUT extension", () => {
    md2HtmlOriginal(commonMarkTestCasesText);
  });
});

describe("markdown-it Specifications text bench", async () => {
  const specText = await readFile(
    new URL("../../../specification.md", import.meta.url),
    "utf-8",
  );

  const tipsText = await readFile(
    new URL("../../../implementers-tips.md", import.meta.url),
    "utf-8",
  );

  const testText = [specText, tipsText].join("\n\n");

  bench("Specification text with extension", () => {
    md2Html(testText);
  });

  bench("Specification text withOUT extension", () => {
    md2HtmlOriginal(testText);
  });
});

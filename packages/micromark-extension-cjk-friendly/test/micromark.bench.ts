import { readFile } from "node:fs/promises";
import { micromark } from "micromark";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { bench } from "vitest";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

const extensions = [cjkFriendlyExtension()];

function md2Html(md: string): string {
  return micromark(md, { extensions });
}

function md2HtmlOriginal(md: string): string {
  return micromark(md);
}

describe("Micromark CJK text bench", async () => {
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

describe("Micromark CommonMark testcase bench", () => {
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

describe("Micromark Specifications text bench", async () => {
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

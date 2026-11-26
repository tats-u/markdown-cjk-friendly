import { readFile } from "node:fs/promises";
import { Marked } from "marked";
import markedCjkFriendly from "marked-cjk-friendly";
import { bench, describe } from "vitest";
import commonMarkTestCases from "../../../testcases/commonmark.json" with {
  type: "json",
};

const marked = new Marked(markedCjkFriendly());
const markedOriginal = new Marked();

describe("Marked CJK text bench", async () => {
  const fixtures = new URL("../../../testcases/", import.meta.url);
  const testText = (
    await Promise.all([
      readFile(new URL("strong.md", fixtures), "utf-8"),
      readFile(new URL("non-bmp.md", fixtures), "utf-8"),
      readFile(new URL("korean.md", fixtures), "utf-8"),
      readFile(new URL("underscore-cjk-punct.md", fixtures), "utf-8"),
      readFile(new URL("gfm-strikethrough.md", fixtures), "utf-8"),
      readFile(new URL("../README.md", import.meta.url), "utf-8"),
    ])
  ).join("\n\n");

  bench("CJK text with extension", () => {
    marked.parse(testText);
  });

  bench("CJK text without extension", () => {
    markedOriginal.parse(testText);
  });
});

describe("Marked CommonMark testcase bench", () => {
  const testText = commonMarkTestCases
    .filter((testCase) => /[*_]/.test(testCase.markdown))
    .map((testCase) => testCase.markdown)
    .join("\n\n");

  bench("CommonMark testcases with extension", () => {
    marked.parse(testText);
  });

  bench("CommonMark testcases without extension", () => {
    markedOriginal.parse(testText);
  });
});

describe("Marked Specifications text bench", async () => {
  const testText = (
    await Promise.all([
      readFile(new URL("../../../specification.md", import.meta.url), "utf-8"),
      readFile(
        new URL("../../../implementers-tips.md", import.meta.url),
        "utf-8",
      ),
    ])
  ).join("\n\n");

  bench("Specification text with extension", () => {
    marked.parse(testText);
  });

  bench("Specification text without extension", () => {
    markedOriginal.parse(testText);
  });
});

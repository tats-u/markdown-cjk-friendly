import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";

async function loadHtml(path: string) {
  return await readFile(new URL(path, import.meta.url), "utf-8");
}

describe("index.html (pages)", () => {
  // biome-ignore lint/style/noNonNullAssertion: not undefined after beforeAll
  let markdown: HTMLElement = undefined!;
  beforeAll(async () => {
    const source = await loadHtml("../doc_build/index.html");
    // biome-ignore lint/style/noNonNullAssertion: asserted in the next line
    markdown = new JSDOM(source).window.document.querySelector(".rspress-doc")!;
    expect(markdown).not.toBeNull();
  });

  it("contains <strong>", () => {
    expect(markdown.querySelector("strong")).not.toBeNull();
  });
  it("contains <del>", () => {
    expect(markdown.querySelector("del")).not.toBeNull();
  });
  it("paragraphs don't contain **", () => {
    for (const paragraph of markdown.querySelectorAll("p")) {
      expect(paragraph.innerHTML).not.toMatch(/\*\*[^\n]+\*\*/);
    }
  });
  it("paragraphs don't contain ~~", () => {
    for (const paragraph of markdown.querySelectorAll("p")) {
      expect(paragraph.innerHTML).not.toMatch(/~~[^\n]+~~/);
    }
  });
});

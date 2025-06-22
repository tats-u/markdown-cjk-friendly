import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { beforeAll, describe, expect, it } from "vitest";

async function loadHtml(path) {
  return await readFile(new URL(path, import.meta.url), "utf-8");
}

describe("index.html (pages)", () => {
  /** @type {HTMLElement} */
  let markdown;
  beforeAll(async () => {
    const source = await loadHtml("../build/index.html");
    markdown = new JSDOM(source).window.document.querySelector("article");
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

describe("docs/index.html", () => {
  /** @type {HTMLElement} */
  let markdown;
  beforeAll(async () => {
    const source = await loadHtml("../build/docs/index.html");
    markdown = new JSDOM(source).window.document.querySelector("article");
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

describe("blog/index.html", () => {
  /** @type {HTMLElement} */
  let markdown;
  beforeAll(async () => {
    const source = await loadHtml("../build/blog/index.html");
    markdown = new JSDOM(source).window.document.querySelector("article");
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

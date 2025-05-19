import { readFile } from "node:fs/promises";
import MarkdownIt from "markdown-it";
import markdownItCjFriendly from "markdown-it-cj-friendly";

const md = MarkdownIt();
md.use(markdownItCjFriendly);

describe("markdown-it-cj-friendly", () => {
  it("** around Kana/Han is converted to <strong>", async () => {
    const result = md.render(
      await readFile(
        new URL("../../../testcases/strong.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      // won't support these variation sequences in cj-friendly (use cjk-friendly instead)
      if (!/[“”‘’…]\ufe01/.test(line)) {
        expect(line).not.toMatch(/\*\*[^\n]+\*\*/);
      }
    }
    expect(result).toMatchSnapshot();
  });

  it("recognizes non-BMP punctuation and symbols", async () => {
    const result = md.render(
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
});

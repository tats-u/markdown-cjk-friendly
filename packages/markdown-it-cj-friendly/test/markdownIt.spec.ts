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
    expect(result.split(/\r?\n/)).not.toContain(/\*\*[^\n]+\*\*/);
    expect(result).toMatchSnapshot();
  });

  it("recognizes non-BMP punctuation and symbols", async () => {
    const result = md.render(
      await readFile(
        new URL("../../../testcases/non-bmp.md", import.meta.url),
        "utf-8",
      ),
    );
    expect(result.split(/\r?\n/)).not.toContain("<strong>");
    expect(result).toMatchSnapshot();
  });
});

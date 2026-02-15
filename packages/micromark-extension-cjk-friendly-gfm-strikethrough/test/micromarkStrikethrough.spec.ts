import { readFile } from "node:fs/promises";
import { micromark } from "micromark";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { gfmStrikethroughCjkFriendly } from "micromark-extension-cjk-friendly-gfm-strikethrough";
import { gfm, gfmHtml } from "micromark-extension-gfm";

const extensions = [
  gfm(),
  cjkFriendlyExtension(),
  gfmStrikethroughCjkFriendly(),
];
const nonCjkExtensions = [gfm()];
const htmlExtensions = [gfmHtml()];

function md2Html(md: string): string {
  return micromark(md, { extensions, htmlExtensions });
}
function md2HtmlNonCjk(md: string): string {
  return micromark(md, { extensions: nonCjkExtensions, htmlExtensions });
}

describe("micromark-extension-gfm-strikethrough", () => {
  it("Compatible with CJK", async () => {
    const result = md2Html(
      await readFile(
        new URL("../../../testcases/gfm-strikethrough.md", import.meta.url),
        "utf-8",
      ),
    );
    for (const line of result.split(/\r?\n/)) {
      expect(line).not.toMatch(/~~[^\n]+~~/);
    }
    expect(result).toMatchSnapshot();
  });

  it("Generates the same output for non-CJK GFM", async () => {
    const source = await readFile(
      new URL("../../../testcases/gfm-non-cjk.md", import.meta.url),
      "utf-8",
    );
    const result = md2Html(source);
    expect(result).toContain("<table");
    expect(result).toContain("<del>");
    expect(result).toEqual(md2HtmlNonCjk(source));
  });

  // Cannot be handled by markdown-it
  // https://github.com/remarkjs/remark-gfm/issues/19
  it("Handles an edge-case combination of strikethrough and emphasis", async () => {
    const source = "a***~~b~~***c";
    const result = md2Html(source);
    expect(result).not.toContain("~~");
    expect(result).not.toContain("*");
    expect(result).toContain("<del>");
    expect(result).toContain("<em>");
    expect(result).toContain("<strong>");
    expect(result).toEqual(md2HtmlNonCjk(source));
  });
});

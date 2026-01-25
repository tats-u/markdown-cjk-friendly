import * as util from "micromark-extension-cjk-friendly-util";

describe("micromark-extension-cjk-friendly-util", () => {
  it.concurrent.each(["あ", "ｱ", "𩸽", "한", "㊙", "₩"])("CJK (%s)", (char) => {
    // biome-ignore lint/style/noNonNullAssertion: not empty
    const code = char.codePointAt(0)!;
    const category = util.classifyCharacter(code);
    expect(util.isCjk(category)).toBe(true);
  });

  it.concurrent.each(["”", "«"])("Non-CJK punctuation (%s)", (char) => {
    // biome-ignore lint/style/noNonNullAssertion: not empty
    const code = char.codePointAt(0)!;
    const category = util.classifyCharacter(code);
    expect(util.isNonCjkPunctuation(category)).toBe(true);
  });

  it.concurrent.each([
    " ",
    "\t",
    "\n",
    "　",
    null,
  ])("Unicode whitespace (%s)", (char) => {
    const code = char?.codePointAt(0) ?? null;
    const category = util.classifyCharacter(code);
    expect(util.isUnicodeWhitespace(category)).toBe(true);
  });

  it.concurrent.each([
    " ",
    "\t",
    "\n",
    "　",
    null,
    "「",
    "㊙",
    "”",
  ])("Space or punctuation (%s)", (char) => {
    const code = char?.codePointAt(0) ?? null;
    const category = util.classifyCharacter(code);
    expect(util.isSpaceOrPunctuation(category)).toBe(true);
  });

  it.concurrent.each(["葛󠄀", "僧󠄁", "冴󠄂", "凞󠄃", "𦉰󠄁"])("IVS (%s)", (char) => {
    // biome-ignore lint/style/noNonNullAssertion: not empty
    const code = char.codePointAt(char.length - 2)!;
    const category = util.classifyCharacter(code);
    expect(util.isIvs(category)).toBe(true);
  });

  it.concurrent.each(["免︀", "艹︁", "㊙︎"])("SVS (%s)", (char) => {
    // biome-ignore lint/style/noNonNullAssertion: not empty
    const code = char.codePointAt(char.length - 1)!;
    const category = util.classifyCharacter(code);
    expect(util.isNonEmojiGeneralUseVS(category)).toBe(true);
  });

  it.concurrent.each(["𩸽", "🈀"])("Surrogate check (%s)", (char) => {
    const highCode = char.charCodeAt(0);
    const lowCode = char.charCodeAt(1);
    expect(util.isCodeHighSurrogate(highCode)).toBe(true);
    expect(util.isCodeLowSurrogate(lowCode)).toBe(true);
  });

  it.concurrent.each([
    "‘",
    "’",
    "“",
    "”",
  ])("Ambiguous punctuation check (%s)", (char) => {
    const vsCode = 0xfe01;
    // biome-ignore lint/style/noNonNullAssertion: not empty
    const punctuationCode = char.codePointAt(0)!;
    const withVs = util.classifyPrecedingCharacter(
      util.classifyCharacter(vsCode),
      () => punctuationCode,
      vsCode,
    );
    const withoutVs = util.classifyCharacter(punctuationCode);
    expect(util.isNonCjkPunctuation(withoutVs)).toBe(true);
    expect(util.isSpaceOrPunctuation(withVs)).toBe(true);
    expect(util.isCjk(withVs)).toBe(true);
  });
});

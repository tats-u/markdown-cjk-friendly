import { eastAsianWidthType } from "get-east-asian-width";
import type { Code } from "micromark-util-types";

/**
 * Check if `uc` is CJK or IVS
 *
 * @param uc code point
 * @returns `true` if `uc` is CJK, `null` if IVS, or `false` if neither
 */
export function cjkOrIvs(uc: Code): boolean | null {
  if (!uc || uc < 0) {
    return false;
  }
  const eaw = eastAsianWidthType(uc);
  switch (eaw) {
    case "fullwidth":
    case "halfwidth":
      return true; // never be emoji
    case "wide":
      return !/^\p{RGI_Emoji}/v.test(String.fromCodePoint(uc));
    case "narrow":
      return false;
    case "ambiguous":
      // no Hangul as of Unicode 16
      // IVS is Ambiguous
      return 0xe0100 <= uc && uc <= 0xe01ef ? null : false;
    case "neutral":
      // 1160..11FF     ; N  # Lo   [160] HANGUL JUNGSEONG FILLER..HANGUL JONGSEONG SSANGNIEUN
      return /^\p{sc=Hangul}/u.test(String.fromCodePoint(uc));
  }
}

/**
 * Check whether the character code represents Standard Variation Sequence that can follow an ideographic character.
 *
 * U+FE0E is used for some CJK symbols (e.g. U+3299) that can also be
 */
// biome-ignore lint/suspicious/noMisleadingCharacterClass: variation selector range
export const svsFollowingCjk = regexCheck(/[\uFE00-\uFE02\uFE0E]/u);

// Size note: removing ASCII from the regex and using `asciiPunctuation` here
// In fact adds to the bundle size.
/**
 * Check whether the character code represents Unicode punctuation.
 *
 * A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
 * Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
 * (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
 * (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
 * punctuation (see `asciiPunctuation`).
 *
 * See:
 * **\[UNICODE]**:
 * [The Unicode Standard](https://www.unicode.org/versions/).
 * Unicode Consortium.
 *
 * @param code
 *   Code.
 * @returns
 *   Whether it matches.
 */
export const unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);

// no Unicode whitespace outside of BMP; Surrogate has its own category Cs
/**
 * Check whether the character code represents Unicode whitespace.
 *
 * Note that this does handle micromark specific markdown whitespace characters.
 * See `markdownLineEndingOrSpace` to check that.
 *
 * A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
 * Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
 * U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
 *
 * See:
 * **\[UNICODE]**:
 * [The Unicode Standard](https://www.unicode.org/versions/).
 * Unicode Consortium.
 *
 * @param code
 *   Code.
 * @returns
 *   Whether it matches.
 */
export const unicodeWhitespace = regexCheck(/\s/);

/**
 * Create a code check from a regex.
 *
 * @param regex
 *   Expression.
 * @returns
 *   Check.
 */
function regexCheck(regex: RegExp): (code: Code) => boolean {
  return check;

  /**
   * Check whether a code matches the bound regex.
   *
   * @param code
   *   Character code.
   * @returns
   *   Whether the character code matches the bound regex.
   */
  function check(code: Code): boolean {
    return code !== null && code > -1 && regex.test(String.fromCodePoint(code));
  }
}

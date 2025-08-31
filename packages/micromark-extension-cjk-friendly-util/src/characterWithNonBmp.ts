import { eastAsianWidthType } from "get-east-asian-width";
import type { Code } from "micromark-util-types";

function isEmoji(uc: number) {
  return /^\p{Emoji_Presentation}/u.test(String.fromCodePoint(uc));
}

/**
 * Check if `uc` is CJK or IVS
 *
 * @param uc code point
 * @returns `true` if `uc` is CJK, `null` if IVS, or `false` if neither
 */
export function cjkOrIvs(uc: Code): boolean | null {
  if (!uc || uc < 0x1100) {
    // < 0x1100: Fast path
    return false;
  }
  const eaw = eastAsianWidthType(uc);
  switch (eaw) {
    case "fullwidth":
    case "halfwidth":
      return true; // never be emoji
    case "wide":
      return !isEmoji(uc);
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

export function isCjkAmbiguousPunctuation(main: Code, vs: Code): boolean {
  if (vs !== 0xfe01 || !main || main < 0x2018) return false;
  return (
    main === 0x2018 || main === 0x2019 || main === 0x201c || main === 0x201d
  );
}

/**
 * Check whether the character code represents Non-emoji General-use Variation Selector (U+FE00-U+FE0E).
 */
export function nonEmojiGeneralUseVS(code: Code) {
  return code !== null && code >= 0xfe00 && code <= 0xfe0e;
}

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
export const unicodePunctuation: (code: Code) => boolean =
  regexCheck(/\p{P}|\p{S}/u);

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
export const unicodeWhitespace: (code: Code) => boolean = regexCheck(/\s/);

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

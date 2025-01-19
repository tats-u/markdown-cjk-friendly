import { eastAsianWidthType } from "get-east-asian-width";
import type MarkdownIt from "markdown-it";
import {
  isMdAsciiPunct,
  isPunctChar,
  isWhiteSpace,
} from "markdown-it/lib/common/utils.mjs";

/**
 * Check if `uc` is CJK. Deferred (returns `null`) if IVS.
 *
 * @param uc code point
 * @returns `true` if `uc` is CJK, `false` if not, `null` if IVS
 */
function isCjkBase(uc: number) {
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

function isCjk(uc: number) {
  return isCjkBase(uc) ?? false;
}

function isCjkOrIvs(uc: number) {
  const raw = isCjkBase(uc);
  return raw === null ? true : raw;
}

function maybeHanSVS(uc: number) {
  return (
    (uc & 0xfff0) === 0xfe00 &&
    ((uc >= 0xfe00 && uc <= 0xfe02) || uc === 0xfe0e)
  );
}

export default function markdownItCjFriendlyPlugin(md: MarkdownIt) {
  const PreviousState = md.inline.State;

  class CjFriendlyState extends PreviousState {
    override scanDelims(start: number, canSplitWord: boolean) {
      const max = this.posMax;
      const marker = this.src.charCodeAt(start);

      let [lastChar, lastCharPos] = getLastCharCode(this.src, start);
      let isLastActuallyTwoPrev = false;
      if (maybeHanSVS(lastChar)) {
        [lastChar, lastCharPos] = getLastCharCode(this.src, lastCharPos);
        isLastActuallyTwoPrev = true;
      }

      let pos = start;
      while (pos < max && this.src.charCodeAt(pos) === marker) {
        pos++;
      }

      const count = pos - start;

      // treat end of the line as a whitespace
      // biome-ignore lint/style/noNonNullAssertion: always in range thanks to pos < max
      const nextChar = pos < max ? this.src.codePointAt(pos)! : 0x20;

      const isLastCJKChar = (isLastActuallyTwoPrev ? isCjk : isCjkOrIvs)(
        lastChar,
      );
      const isNextCJKChar = isCjk(nextChar);

      const isLastPunctChar =
        isMdAsciiPunct(lastChar) || isPunctChar(String.fromCodePoint(lastChar));
      const isNextPunctChar =
        isMdAsciiPunct(nextChar) || isPunctChar(String.fromCodePoint(nextChar));
      const isLastNonCjkPunctChar = isLastPunctChar && !isLastCJKChar;
      const isNextNonCjkPunctChar = isNextPunctChar && !isNextCJKChar;

      const isLastWhiteSpace = isWhiteSpace(lastChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);

      const left_flanking =
        !isNextWhiteSpace &&
        (!isNextNonCjkPunctChar ||
          isLastNonCjkPunctChar ||
          isLastWhiteSpace ||
          isLastCJKChar);
      const right_flanking =
        !isLastWhiteSpace &&
        (!isLastNonCjkPunctChar ||
          isNextWhiteSpace ||
          isNextNonCjkPunctChar ||
          isNextCJKChar);

      const can_open =
        left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
      const can_close =
        right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);

      return { can_open, can_close, length: count };

      function getLastCharCode(str: string, pos: number): [number, number] {
        // treat beginning of the line as a whitespace
        if (pos <= 0) {
          return [0x20, -1];
        }
        const charCode = str.charCodeAt(pos - 1);
        // not low surrogates (BMP)
        if ((charCode & 0xfc00) !== 0xdc00) {
          return [charCode, pos - 1];
        }

        // undefined if out of range (leading stray low surrogates)
        const codePoint = str.codePointAt(pos - 2);
        // biome-ignore lint/style/noNonNullAssertion: undefined > 0xffff = false, so we don't need extra check here
        return codePoint! > 0xffff
          ? // biome-ignore lint/style/noNonNullAssertion: ditto
            [codePoint!, pos - 2]
          : [charCode, pos - 1];
      }
    }
  }

  md.inline.State = CjFriendlyState;
}

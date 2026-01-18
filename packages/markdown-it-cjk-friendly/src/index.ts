import { eastAsianWidthType } from "get-east-asian-width";
import type MarkdownIt from "markdown-it";
import {
  isMdAsciiPunct,
  isPunctChar,
  isWhiteSpace,
} from "markdown-it/lib/common/utils.mjs";
import type { Scanned } from "markdown-it/lib/rules_inline/state_inline.mjs";

function isEmoji(uc: number) {
  return /^\p{Emoji_Presentation}/u.test(String.fromCodePoint(uc));
}

/**
 * Check if `uc` is CJK. Deferred (returns `null`) if IVS.
 *
 * @param uc code point
 * @returns `true` if `uc` is CJK, `false` if not, `null` if IVS
 */
function isCjkBase(uc: number) {
  if (uc < 0x1100) return false; // Fast path; see: https://www.unicode.org/Public/UCD/latest/ucd/Scripts.txt
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
      // needs an additional check according to the distance from the emphasis
      return null;
    case "neutral":
      // 1160..11FF     ; N  # Lo   [160] HANGUL JUNGSEONG FILLER..HANGUL JONGSEONG SSANGNIEUN
      return /^\p{sc=Hangul}/u.test(String.fromCodePoint(uc));
  }
}

function is2PreviousCjk(uc: number, prev: number) {
  // https://www.unicode.org/Public/16.0.0/ucd/StandardizedVariants.txt
  // See {left,right}-justified fullwidth form in East Asian punctuation positional and width variants
  return isCjkBase(uc) ?? (prev === 0xfe01 && isQuotationMark(uc));

  function isQuotationMark(uc: number) {
    return uc === 0x2018 || uc === 0x2019 || uc === 0x201c || uc === 0x201d;
  }
}

function isPreviousCjk(uc: number) {
  // IVS is Ambiguous
  return isCjkBase(uc) ?? (0xe0100 <= uc && uc <= 0xe01ef);
}

function isNextCjk(uc: number) {
  return isCjkBase(uc) ?? false;
}

function nonEmojiGeneralUseVS(uc: number) {
  return uc >= 0xfe00 && uc <= 0xfe0e;
}

export default function markdownItCjkFriendlyPlugin(md: MarkdownIt): void {
  const PreviousState = md.inline.State;

  class CjkFriendlyState extends PreviousState {
    override scanDelims(start: number, canSplitWord: boolean): Scanned {
      const max = this.posMax;
      const marker = this.src.charCodeAt(start);

      const [lastChar, lastCharPos] = getLastCharCode(this.src, start);
      let lastMainChar = lastChar;
      let twoPrevChar: number | null = null;

      if (nonEmojiGeneralUseVS(lastChar)) {
        twoPrevChar = getLastCharCode(this.src, lastCharPos)[0];
        if (!/^\p{Zs}/u.test(String.fromCodePoint(twoPrevChar))) {
          lastMainChar = twoPrevChar;
        }
      }

      let pos = start;
      while (pos < max && this.src.charCodeAt(pos) === marker) {
        pos++;
      }

      const count = pos - start;

      // treat end of the line as a whitespace
      // biome-ignore lint/style/noNonNullAssertion: always in range thanks to pos < max
      const nextChar = pos < max ? this.src.codePointAt(pos)! : 0x20;

      // We don't consider a sequence of a Unicode whitespace followed by a general-use VS
      const isLastWhiteSpace = isWhiteSpace(lastMainChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);

      // Fast path for the most cases adjacent to whitespaces (no need to check for CJK characters)
      if (isLastWhiteSpace || isNextWhiteSpace) {
        return {
          can_open: !isNextWhiteSpace,
          can_close: !isLastWhiteSpace,
          length: count,
        };
      }

      const isLastPunctChar =
        isMdAsciiPunct(lastMainChar) ||
        isPunctChar(String.fromCodePoint(lastMainChar));
      const isNextPunctChar =
        isMdAsciiPunct(nextChar) || isPunctChar(String.fromCodePoint(nextChar));

      // Fast path for `_`
      let left_flanking = isLastPunctChar;
      let right_flanking = isNextPunctChar;

      if (canSplitWord) {
        // Slow path for `*`

        const isEitherCJKChar =
          // We don't consider a sequence of an ideographic VS followed by a general-purpose VS
          isNextCjk(nextChar) ||
          // isPreviousCjk (more complex than isNextCjk as for now, so place it last)
          (twoPrevChar !== null
            ? is2PreviousCjk(twoPrevChar, lastChar)
            : isPreviousCjk(lastChar));

        left_flanking ||= isEitherCJKChar || !isNextPunctChar;
        right_flanking ||= isEitherCJKChar || !isLastPunctChar;
      }

      return {
        can_open: left_flanking,
        can_close: right_flanking,
        length: count,
      };

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

  md.inline.State = CjkFriendlyState;
}

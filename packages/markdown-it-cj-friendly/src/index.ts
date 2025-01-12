import type MarkdownIt from "markdown-it";
import {
  isMdAsciiPunct,
  isPunctChar,
  isWhiteSpace,
} from "markdown-it/lib/common/utils.mjs";

function isCj(uc: number) {
  if (uc < 0x2e80) {
    return false;
  }
  return (
    (uc >= 0x2e80 &&
      /* uc <= 0x2eff) // CJK Radicals Supplement
      || (uc >= 0x2f00 && uc <= 0x2fdf) // Kangxi Radicals
  //  || (uc >= 0x2fe0 && uc <= 0x2fef) // Unused region but blocks on both sides are CJK
      || (uc >= 0x2ff0 && uc <= 0x2fff) // Ideographic Description Characters
      || (uc >= 0x3000 && uc <= 0x303f) // CJK Symbols and Punctuation
      || (uc >= 0x3040 && uc <= 0x309f) // Hiragana
      || (uc >= 0x30a0 && uc <= 0x30ff) // Katakana
      || (uc >= 0x3100 && uc <= 0x312f) // Bopomofo
      || (uc >= 0x3130 && uc <= 0x318f) // Hangul Compatibility Jamo
      || (uc >= 0x3190 && uc <= 0x319f) // Kanbun
      || (uc >= 0x31a0 && uc <= 0x31bf) // Bopomofo Extended
      || (uc >= 0x31c0 && uc <= 0x31ef) // CJK Strokes
      || (uc >= 0x31f0 && uc <= 0x31ff) // Katakana Phonetic Extensions
      || (uc >= 0x3200 && uc <= 0x32ff) // Enclosed CJK Letters & Months
      || (uc >= 0x3300 && uc <= 0x33ff) // CJK Compatibility
      || (uc >= 0x3400 && */ uc <= 0x4dbf) || // CJK Unified Ideographs Extension A
    (uc >= 0x4e00 &&
      /* uc <= 0x9fff) // CJK Unified Ideographs
      || (uc >= 0xa000 && uc <= 0xa48f) // Yi Syllables
      || (uc >= 0xa490 && */ uc <= 0xa4cf) || // Yi Radicals
    (uc >= 0xf900 && uc <= 0xfaff) || // CJK Compatibility Ideographs
    (uc >= 0xfe10 && uc <= 0xfe1f) || // Vertical forms
    (uc >= 0xfe30 &&
      /* uc <= 0xfe4f) // CJK Compatibility Forms
      || (uc >= 0xFE50 && */ uc <= 0xfe6f) || // Small Form Variants
    (uc >= 0xff00 && uc <= 0xffee) || // Halfwidth and Fullwidth Forms
    (uc >= 0x1b000 &&
      /* uc <= 0x1B0FF) // Kana Supplement
      || (uc >= 0x1B100 && uc <= 0x1B12F) // Kana Extended-A
      || (uc >= 0x1B130 && */ uc <= 0x1b16f) || // Small Kana Extension
    (uc >= 0x20000 &&
      /* uc <= 0x2A6DF) // CJK Unified Ideographs Extension B
      || (uc >= 0x2A700 && uc <= 0x2B73F) // CJK Unified Ideographs Extension C
      || (uc >= 0x2B740 && uc <= 0x2B81F) // CJK Unified Ideographs Extension D
      || (uc >= 0x2B820 && uc <= 0x2CEAF) // CJK Unified Ideographs Extension E
      || (uc >= 0x2CEB0 && uc <= 0x2EBEF) // CJK Unified Ideographs Extension F
  //  || (uc >= 0x2EBF0 && uc <= 0x2F7FF) // Unused SIP region (probably CJK characters will be allocated)
      || (uc >= 0x2F800 && uc <= 0x2FA1F) // CJK Compatibility Ideographs Supplement
  //  || (uc >= 0x2FA20 && uc <= 0x2FFFF) // Unused SIP region (probably CJK characters will be allocated)
      || (uc >= 0x30000 && uc <= 0x3134F) // CJK Unified Ideographs Extension G
      || (uc >= 0x31350 && uc <= 0x323AF) // CJK Unified Ideographs Extension H
  //  || (uc >= 0x323B0 && */ uc <= 0x3ffff) || // Unused TIP region (probably CJK characters will be allocated)
    (uc >= 0xe0100 && uc <= 0xe01ef) // Ideographic Variation Sequences
  );
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
      if (maybeHanSVS(lastChar))
        [lastChar, lastCharPos] = getLastCharCode(this.src, lastCharPos);

      let pos = start;
      while (pos < max && this.src.charCodeAt(pos) === marker) {
        pos++;
      }

      const count = pos - start;

      // treat end of the line as a whitespace
      // biome-ignore lint/style/noNonNullAssertion: always in range thanks to pos < max
      const nextChar = pos < max ? this.src.codePointAt(pos)! : 0x20;

      const isLastPunctChar =
        isMdAsciiPunct(lastChar) || isPunctChar(String.fromCodePoint(lastChar));
      const isNextPunctChar =
        isMdAsciiPunct(nextChar) || isPunctChar(String.fromCodePoint(nextChar));

      const isLastWhiteSpace = isWhiteSpace(lastChar);
      const isNextWhiteSpace = isWhiteSpace(nextChar);

      const isLastCJChar = isCj(lastChar);
      const isNextCjChar = isCj(nextChar);
      const adjacentToCjChar = isLastCJChar || isNextCjChar;

      const left_flanking =
        !isNextWhiteSpace &&
        (!isNextPunctChar ||
          isLastWhiteSpace ||
          isLastPunctChar ||
          adjacentToCjChar);
      const right_flanking =
        !isLastWhiteSpace &&
        (!isLastPunctChar ||
          isNextWhiteSpace ||
          isNextPunctChar ||
          adjacentToCjChar);

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

import { eastAsianWidthType } from "get-east-asian-width";
import type MarkdownIt from "markdown-it";
import {
  isMdAsciiPunct,
  isPunctChar,
  isWhiteSpace,
} from "markdown-it/lib/common/utils.mjs";

const isEmoji = function (
  this: { fn: ((uc: number) => boolean) | null },
  uc: number,
) {
  if (this.fn !== null) {
    return this.fn(uc);
  }

  try {
    // biome-ignore lint/complexity/useRegexLiterals: avoid SyntaxError in old runtimes
    const regex = new RegExp("^\\p{RGI_Emoji}", "v");
    this.fn = (uc_: number) => regex.test(String.fromCodePoint(uc_));
  } catch (e) {
    if (!(e instanceof SyntaxError)) {
      throw e;
    }
    // Fall back to the snapshot as of Unicode 16
    // https://unicode.org/Public/emoji/16.0/emoji-sequences.txt
    this.fn = (cp: number) =>
      (0x231a <= cp && cp <= 0x231b) ||
      (0x23e9 <= cp && cp <= 0x23ec) ||
      cp === 0x23f0 ||
      cp === 0x23f3 ||
      (0x25fd <= cp && cp <= 0x25fe) ||
      (0x2614 <= cp && cp <= 0x2615) ||
      (0x2648 <= cp && cp <= 0x2653) ||
      cp === 0x267f ||
      cp === 0x2693 ||
      cp === 0x26a1 ||
      (0x26aa <= cp && cp <= 0x26ab) ||
      (0x26bd <= cp && cp <= 0x26be) ||
      (0x26c4 <= cp && cp <= 0x26c5) ||
      cp === 0x26ce ||
      cp === 0x26d4 ||
      cp === 0x26ea ||
      (0x26f2 <= cp && cp <= 0x26f3) ||
      cp === 0x26f5 ||
      cp === 0x26fa ||
      cp === 0x26fd ||
      cp === 0x2705 ||
      (0x270a <= cp && cp <= 0x270b) ||
      cp === 0x2728 ||
      cp === 0x274c ||
      cp === 0x274e ||
      (0x2753 <= cp && cp <= 0x2755) ||
      cp === 0x2757 ||
      (0x2795 <= cp && cp <= 0x2797) ||
      cp === 0x27b0 ||
      cp === 0x27bf ||
      (0x2b1b <= cp && cp <= 0x2b1c) ||
      cp === 0x2b50 ||
      cp === 0x2b55 ||
      cp === 0x1f004 ||
      cp === 0x1f0cf ||
      cp === 0x1f18e ||
      (0x1f191 <= cp && cp <= 0x1f19a) ||
      cp === 0x1f201 ||
      cp === 0x1f21a ||
      cp === 0x1f22f ||
      (0x1f232 <= cp && cp <= 0x1f236) ||
      (0x1f238 <= cp && cp <= 0x1f23a) ||
      (0x1f250 <= cp && cp <= 0x1f251) ||
      (0x1f300 <= cp && cp <= 0x1f30c) ||
      (0x1f30d <= cp && cp <= 0x1f30e) ||
      cp === 0x1f30f ||
      cp === 0x1f310 ||
      cp === 0x1f311 ||
      cp === 0x1f312 ||
      (0x1f313 <= cp && cp <= 0x1f315) ||
      (0x1f316 <= cp && cp <= 0x1f318) ||
      cp === 0x1f319 ||
      cp === 0x1f31a ||
      cp === 0x1f31b ||
      cp === 0x1f31c ||
      (0x1f31d <= cp && cp <= 0x1f31e) ||
      (0x1f31f <= cp && cp <= 0x1f320) ||
      (0x1f32d <= cp && cp <= 0x1f32f) ||
      (0x1f330 <= cp && cp <= 0x1f331) ||
      (0x1f332 <= cp && cp <= 0x1f333) ||
      (0x1f334 <= cp && cp <= 0x1f335) ||
      (0x1f337 <= cp && cp <= 0x1f34a) ||
      cp === 0x1f34b ||
      (0x1f34c <= cp && cp <= 0x1f34f) ||
      cp === 0x1f350 ||
      (0x1f351 <= cp && cp <= 0x1f37b) ||
      cp === 0x1f37c ||
      (0x1f37e <= cp && cp <= 0x1f37f) ||
      (0x1f380 <= cp && cp <= 0x1f393) ||
      (0x1f3a0 <= cp && cp <= 0x1f3c4) ||
      cp === 0x1f3c5 ||
      cp === 0x1f3c6 ||
      cp === 0x1f3c7 ||
      cp === 0x1f3c8 ||
      cp === 0x1f3c9 ||
      cp === 0x1f3ca ||
      (0x1f3cf <= cp && cp <= 0x1f3d3) ||
      (0x1f3e0 <= cp && cp <= 0x1f3e3) ||
      cp === 0x1f3e4 ||
      (0x1f3e5 <= cp && cp <= 0x1f3f0) ||
      cp === 0x1f3f4 ||
      (0x1f3f8 <= cp && cp <= 0x1f407) ||
      cp === 0x1f408 ||
      (0x1f409 <= cp && cp <= 0x1f40b) ||
      (0x1f40c <= cp && cp <= 0x1f40e) ||
      (0x1f40f <= cp && cp <= 0x1f410) ||
      (0x1f411 <= cp && cp <= 0x1f412) ||
      cp === 0x1f413 ||
      cp === 0x1f414 ||
      cp === 0x1f415 ||
      cp === 0x1f416 ||
      (0x1f417 <= cp && cp <= 0x1f429) ||
      cp === 0x1f42a ||
      (0x1f42b <= cp && cp <= 0x1f43e) ||
      cp === 0x1f440 ||
      (0x1f442 <= cp && cp <= 0x1f464) ||
      cp === 0x1f465 ||
      (0x1f466 <= cp && cp <= 0x1f46b) ||
      (0x1f46c <= cp && cp <= 0x1f46d) ||
      (0x1f46e <= cp && cp <= 0x1f4ac) ||
      cp === 0x1f4ad ||
      (0x1f4ae <= cp && cp <= 0x1f4b5) ||
      (0x1f4b6 <= cp && cp <= 0x1f4b7) ||
      (0x1f4b8 <= cp && cp <= 0x1f4eb) ||
      (0x1f4ec <= cp && cp <= 0x1f4ed) ||
      cp === 0x1f4ee ||
      cp === 0x1f4ef ||
      (0x1f4f0 <= cp && cp <= 0x1f4f4) ||
      cp === 0x1f4f5 ||
      (0x1f4f6 <= cp && cp <= 0x1f4f7) ||
      cp === 0x1f4f8 ||
      (0x1f4f9 <= cp && cp <= 0x1f4fc) ||
      (0x1f4ff <= cp && cp <= 0x1f502) ||
      cp === 0x1f503 ||
      (0x1f504 <= cp && cp <= 0x1f507) ||
      cp === 0x1f508 ||
      cp === 0x1f509 ||
      (0x1f50a <= cp && cp <= 0x1f514) ||
      cp === 0x1f515 ||
      (0x1f516 <= cp && cp <= 0x1f52b) ||
      (0x1f52c <= cp && cp <= 0x1f52d) ||
      (0x1f52e <= cp && cp <= 0x1f53d) ||
      (0x1f54b <= cp && cp <= 0x1f54e) ||
      (0x1f550 <= cp && cp <= 0x1f55b) ||
      (0x1f55c <= cp && cp <= 0x1f567) ||
      cp === 0x1f57a ||
      (0x1f595 <= cp && cp <= 0x1f596) ||
      cp === 0x1f5a4 ||
      (0x1f5fb <= cp && cp <= 0x1f5ff) ||
      cp === 0x1f600 ||
      (0x1f601 <= cp && cp <= 0x1f606) ||
      (0x1f607 <= cp && cp <= 0x1f608) ||
      (0x1f609 <= cp && cp <= 0x1f60d) ||
      cp === 0x1f60e ||
      cp === 0x1f60f ||
      cp === 0x1f610 ||
      cp === 0x1f611 ||
      (0x1f612 <= cp && cp <= 0x1f614) ||
      cp === 0x1f615 ||
      cp === 0x1f616 ||
      cp === 0x1f617 ||
      cp === 0x1f618 ||
      cp === 0x1f619 ||
      cp === 0x1f61a ||
      cp === 0x1f61b ||
      (0x1f61c <= cp && cp <= 0x1f61e) ||
      cp === 0x1f61f ||
      (0x1f620 <= cp && cp <= 0x1f625) ||
      (0x1f626 <= cp && cp <= 0x1f627) ||
      (0x1f628 <= cp && cp <= 0x1f62b) ||
      cp === 0x1f62c ||
      cp === 0x1f62d ||
      (0x1f62e <= cp && cp <= 0x1f62f) ||
      (0x1f630 <= cp && cp <= 0x1f633) ||
      cp === 0x1f634 ||
      cp === 0x1f635 ||
      cp === 0x1f636 ||
      (0x1f637 <= cp && cp <= 0x1f640) ||
      (0x1f641 <= cp && cp <= 0x1f644) ||
      (0x1f645 <= cp && cp <= 0x1f64f) ||
      cp === 0x1f680 ||
      (0x1f681 <= cp && cp <= 0x1f682) ||
      (0x1f683 <= cp && cp <= 0x1f685) ||
      cp === 0x1f686 ||
      cp === 0x1f687 ||
      cp === 0x1f688 ||
      cp === 0x1f689 ||
      (0x1f68a <= cp && cp <= 0x1f68b) ||
      cp === 0x1f68c ||
      cp === 0x1f68d ||
      cp === 0x1f68e ||
      cp === 0x1f68f ||
      cp === 0x1f690 ||
      (0x1f691 <= cp && cp <= 0x1f693) ||
      cp === 0x1f694 ||
      cp === 0x1f695 ||
      cp === 0x1f696 ||
      cp === 0x1f697 ||
      cp === 0x1f698 ||
      (0x1f699 <= cp && cp <= 0x1f69a) ||
      (0x1f69b <= cp && cp <= 0x1f6a1) ||
      cp === 0x1f6a2 ||
      cp === 0x1f6a3 ||
      (0x1f6a4 <= cp && cp <= 0x1f6a5) ||
      cp === 0x1f6a6 ||
      (0x1f6a7 <= cp && cp <= 0x1f6ad) ||
      (0x1f6ae <= cp && cp <= 0x1f6b1) ||
      cp === 0x1f6b2 ||
      (0x1f6b3 <= cp && cp <= 0x1f6b5) ||
      cp === 0x1f6b6 ||
      (0x1f6b7 <= cp && cp <= 0x1f6b8) ||
      (0x1f6b9 <= cp && cp <= 0x1f6be) ||
      cp === 0x1f6bf ||
      cp === 0x1f6c0 ||
      (0x1f6c1 <= cp && cp <= 0x1f6c5) ||
      cp === 0x1f6cc ||
      cp === 0x1f6d0 ||
      (0x1f6d1 <= cp && cp <= 0x1f6d2) ||
      cp === 0x1f6d5 ||
      (0x1f6d6 <= cp && cp <= 0x1f6d7) ||
      cp === 0x1f6dc ||
      (0x1f6dd <= cp && cp <= 0x1f6df) ||
      (0x1f6eb <= cp && cp <= 0x1f6ec) ||
      (0x1f6f4 <= cp && cp <= 0x1f6f6) ||
      (0x1f6f7 <= cp && cp <= 0x1f6f8) ||
      cp === 0x1f6f9 ||
      cp === 0x1f6fa ||
      (0x1f6fb <= cp && cp <= 0x1f6fc) ||
      (0x1f7e0 <= cp && cp <= 0x1f7eb) ||
      cp === 0x1f7f0 ||
      cp === 0x1f90c ||
      (0x1f90d <= cp && cp <= 0x1f90f) ||
      (0x1f910 <= cp && cp <= 0x1f918) ||
      (0x1f919 <= cp && cp <= 0x1f91e) ||
      cp === 0x1f91f ||
      (0x1f920 <= cp && cp <= 0x1f927) ||
      (0x1f928 <= cp && cp <= 0x1f92f) ||
      cp === 0x1f930 ||
      (0x1f931 <= cp && cp <= 0x1f932) ||
      (0x1f933 <= cp && cp <= 0x1f93a) ||
      (0x1f93c <= cp && cp <= 0x1f93e) ||
      cp === 0x1f93f ||
      (0x1f940 <= cp && cp <= 0x1f945) ||
      (0x1f947 <= cp && cp <= 0x1f94b) ||
      cp === 0x1f94c ||
      (0x1f94d <= cp && cp <= 0x1f94f) ||
      (0x1f950 <= cp && cp <= 0x1f95e) ||
      (0x1f95f <= cp && cp <= 0x1f96b) ||
      (0x1f96c <= cp && cp <= 0x1f970) ||
      cp === 0x1f971 ||
      cp === 0x1f972 ||
      (0x1f973 <= cp && cp <= 0x1f976) ||
      (0x1f977 <= cp && cp <= 0x1f978) ||
      cp === 0x1f979 ||
      cp === 0x1f97a ||
      cp === 0x1f97b ||
      (0x1f97c <= cp && cp <= 0x1f97f) ||
      (0x1f980 <= cp && cp <= 0x1f984) ||
      (0x1f985 <= cp && cp <= 0x1f991) ||
      (0x1f992 <= cp && cp <= 0x1f997) ||
      (0x1f998 <= cp && cp <= 0x1f9a2) ||
      (0x1f9a3 <= cp && cp <= 0x1f9a4) ||
      (0x1f9a5 <= cp && cp <= 0x1f9aa) ||
      (0x1f9ab <= cp && cp <= 0x1f9ad) ||
      (0x1f9ae <= cp && cp <= 0x1f9af) ||
      (0x1f9b0 <= cp && cp <= 0x1f9b9) ||
      (0x1f9ba <= cp && cp <= 0x1f9bf) ||
      cp === 0x1f9c0 ||
      (0x1f9c1 <= cp && cp <= 0x1f9c2) ||
      (0x1f9c3 <= cp && cp <= 0x1f9ca) ||
      cp === 0x1f9cb ||
      cp === 0x1f9cc ||
      (0x1f9cd <= cp && cp <= 0x1f9cf) ||
      (0x1f9d0 <= cp && cp <= 0x1f9e6) ||
      (0x1f9e7 <= cp && cp <= 0x1f9ff) ||
      (0x1fa70 <= cp && cp <= 0x1fa73) ||
      cp === 0x1fa74 ||
      (0x1fa75 <= cp && cp <= 0x1fa77) ||
      (0x1fa78 <= cp && cp <= 0x1fa7a) ||
      (0x1fa7b <= cp && cp <= 0x1fa7c) ||
      (0x1fa80 <= cp && cp <= 0x1fa82) ||
      (0x1fa83 <= cp && cp <= 0x1fa86) ||
      (0x1fa87 <= cp && cp <= 0x1fa88) ||
      cp === 0x1fa89 ||
      cp === 0x1fa8f ||
      (0x1fa90 <= cp && cp <= 0x1fa95) ||
      (0x1fa96 <= cp && cp <= 0x1faa8) ||
      (0x1faa9 <= cp && cp <= 0x1faac) ||
      (0x1faad <= cp && cp <= 0x1faaf) ||
      (0x1fab0 <= cp && cp <= 0x1fab6) ||
      (0x1fab7 <= cp && cp <= 0x1faba) ||
      (0x1fabb <= cp && cp <= 0x1fabd) ||
      cp === 0x1fabe ||
      cp === 0x1fabf ||
      (0x1fac0 <= cp && cp <= 0x1fac2) ||
      (0x1fac3 <= cp && cp <= 0x1fac5) ||
      cp === 0x1fac6 ||
      (0x1face <= cp && cp <= 0x1facf) ||
      (0x1fad0 <= cp && cp <= 0x1fad6) ||
      (0x1fad7 <= cp && cp <= 0x1fad9) ||
      (0x1fada <= cp && cp <= 0x1fadb) ||
      cp === 0x1fadc ||
      cp === 0x1fadf ||
      (0x1fae0 <= cp && cp <= 0x1fae7) ||
      cp === 0x1fae8 ||
      cp === 0x1fae9 ||
      (0x1faf0 <= cp && cp <= 0x1faf6) ||
      (0x1faf7 <= cp && cp <= 0x1faf8);
  }
  return this.fn(uc);
}.bind({
  fn: null,
});

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

function isCjk(uc: number) {
  return isCjkBase(uc) ?? false;
}

function isCjkOrIvs(uc: number) {
  const raw = isCjkBase(uc);
  return raw === null ? true : raw;
}

function maybeHanSVS(uc: number) {
  return uc >= 0xfe00 && uc <= 0xfe0e;
}

export default function markdownItCjFriendlyPlugin(md: MarkdownIt): void {
  const PreviousState = md.inline.State;

  class CjFriendlyState extends PreviousState {
    override scanDelims(start: number, canSplitWord: boolean) {
      const max = this.posMax;
      const marker = this.src.charCodeAt(start);

      const [lastChar, lastCharPos] = getLastCharCode(this.src, start);
      let lastMainChar = lastChar;
      if (maybeHanSVS(lastChar)) {
        const twoPrevChar = getLastCharCode(this.src, lastCharPos)[0];
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

      // We don't consider a sequence of an ideographic VS followed by a general-purpose VS
      const isLastCJKChar = isCjkOrIvs(lastMainChar);
      const isNextCJKChar = isCjk(nextChar);

      const isLastPunctChar =
        isMdAsciiPunct(lastMainChar) ||
        isPunctChar(String.fromCodePoint(lastMainChar));
      const isNextPunctChar =
        isMdAsciiPunct(nextChar) || isPunctChar(String.fromCodePoint(nextChar));
      const isLastNonCjkPunctChar = isLastPunctChar && !isLastCJKChar;
      const isNextNonCjkPunctChar = isNextPunctChar && !isNextCJKChar;

      // We don't consider a sequence of an Unicode whitespace followed by a general-purpose VS
      const isLastWhiteSpace = isWhiteSpace(lastMainChar);
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

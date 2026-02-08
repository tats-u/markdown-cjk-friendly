import { markdownLineEndingOrSpace } from "micromark-util-character";
import { codes, constants } from "micromark-util-symbol";
import type { Code } from "micromark-util-types";
import { isNonEmojiGeneralUseVS, isUnicodeWhitespace } from "./categoryUtil.js";
import {
  cjkOrIvs,
  isCjkAmbiguousPunctuation,
  isQuotationMark,
  nonEmojiGeneralUseVS,
  unicodePunctuation,
  unicodeWhitespace,
  wideEmojiCapability,
} from "./characterWithNonBmp.js";

export namespace constantsEx {
  export const spaceOrPunctuation = 3 as const;
  export const cjk = 0x1000 as const;
  export const cjkPunctuation = 0x1002 as const;
  export const ivs = 0x2000 as const;
  export const cjkOrIvs = 0x3000 as const;
  export const nonEmojiGeneralUseVS = 0x4000 as const;
  export const variationSelector = 0x6000 as const;
  export const ivsToCjkRightShift = 1 as const; // ivs / cjk
}

/**
 * Classify whether a code represents whitespace, punctuation, or something
 * else.
 *
 * Used for attention (emphasis, strong), whose sequences can open or close
 * based on the class of surrounding characters.
 *
 * > 👉 **Note**: eof (`null`) is seen as whitespace.
 *
 * @param code
 *   Code.
 * @returns
 *   Group.
 */
export function classifyCharacter(
  code: Code,
):
  | typeof constants.characterGroupWhitespace
  | typeof constants.characterGroupPunctuation
  | typeof constantsEx.cjk
  | typeof constantsEx.cjkPunctuation
  | typeof constantsEx.ivs
  | typeof constantsEx.nonEmojiGeneralUseVS
  | 0 {
  if (
    code === codes.eof ||
    markdownLineEndingOrSpace(code) ||
    unicodeWhitespace(code)
  ) {
    return constants.characterGroupWhitespace;
  }

  let value = 0;

  if (code >= 0x1100) {
    if (nonEmojiGeneralUseVS(code)) {
      return constantsEx.nonEmojiGeneralUseVS;
    }
    switch (cjkOrIvs(code)) {
      case null: // IVS
        return constantsEx.ivs;
      case true:
        value |= constantsEx.cjk;
        break;
    }
  }
  if (unicodePunctuation(code)) {
    value |= constants.characterGroupPunctuation;
  }

  return value as
    | typeof constantsEx.cjk
    | typeof constants.characterGroupPunctuation
    | typeof constantsEx.cjkPunctuation
    // returned undefined in original micromark for uncategorized characters, but 0 is better for bitwise operations
    | 0;
}

/**}
 * Classify whether a code represents whitespace, punctuation, or something else.
 *
 * Recognizes general-use variation selectors. Use this instead of {@linkcode classifyCharacter} for previous character.
 *
 * @param before result of {@linkcode classifyCharacter} of the preceding character.
 * @param get2Previous a function that returns the code point of the character before the preceding character. Use lambda or {@linkcode Function.prototype.bind}.
 * @param previous code point of the preceding character
 * @returns
 *   Group of the main code point of the preceding character. Use `isCjkOrIvs` to check whether it is CJK
 */
export function classifyPrecedingCharacter(
  before: ReturnType<typeof classifyCharacter>,
  get2Previous: () => Code,
  previous: Code,
): ReturnType<typeof classifyCharacter> {
  if (!isNonEmojiGeneralUseVS(before)) {
    return before;
  }
  const twoPrevious = get2Previous();
  const twoBefore = classifyCharacter(twoPrevious);

  if (!twoPrevious || isUnicodeWhitespace(twoBefore)) {
    return before;
  }
  if (isCjkAmbiguousPunctuation(twoPrevious, previous)) {
    return constantsEx.cjkPunctuation;
  }

  // Wide emoji-capable characters followed by text/emoji VS
  const cap = wideEmojiCapability(twoPrevious);
  if (cap !== 0) {
    const stripped = stripIvs(twoBefore);
    if (cap === 1) {
      // Default emoji (Emoji_Presentation): CJK if followed by text VS (FE0E)
      return previous === 0xfe0e
        ? ((stripped | constantsEx.cjk) as ReturnType<typeof classifyCharacter>)
        : stripped;
    }
    // Non-default emoji CJK: NOT CJK if followed by emoji VS (FE0F)
    return previous === 0xfe0f
      ? ((stripped & ~constantsEx.cjk) as ReturnType<typeof classifyCharacter>)
      : stripped;
  }

  return stripIvs(twoBefore);
}

/**
 * Classify whether a code represents whitespace, punctuation, or something else.
 *
 * Adjusts the classification of the following character based on the character after it (variation selectors).
 * Use this instead of {@linkcode classifyCharacter} for the next character.
 *
 * @param after result of {@linkcode classifyCharacter} of the following character.
 * @param getNextNext a function that returns the code point of the character after the following character. Use lambda or {@linkcode Function.prototype.bind}.
 * @param next code point of the following character
 * @returns
 *   Adjusted group of the following character
 */
export function classifyFollowingCharacter(
  after: ReturnType<typeof classifyCharacter>,
  getNextNext: () => Code,
  next: Code,
): ReturnType<typeof classifyCharacter> {
  if (!next || next < 0x1100) {
    return after;
  }

  // Quotation marks (''"") followed by FE01 → CJK ambiguous punctuation
  if (isQuotationMark(next)) {
    const nextNext = getNextNext();
    return nextNext === 0xfe01 ? constantsEx.cjkPunctuation : after;
  }

  // Wide emoji-capable characters
  const cap = wideEmojiCapability(next);
  if (cap === 0) return after;

  const nextNext = getNextNext();
  if (cap === 1) {
    // Default emoji (Emoji_Presentation): CJK if followed by text VS (FE0E)
    return nextNext === 0xfe0e
      ? ((after | constantsEx.cjk) as ReturnType<typeof classifyCharacter>)
      : after;
  }
  // Non-default emoji CJK: NOT CJK if followed by emoji VS (FE0F)
  return nextNext === 0xfe0f
    ? ((after & ~constantsEx.cjk) as ReturnType<typeof classifyCharacter>)
    : after;
}

function stripIvs(
  twoBefore: ReturnType<typeof classifyCharacter>,
): ReturnType<typeof classifyCharacter> {
  return (twoBefore & ~constantsEx.ivs) as ReturnType<typeof classifyCharacter>;
}

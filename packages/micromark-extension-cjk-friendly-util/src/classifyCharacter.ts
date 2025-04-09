import { markdownLineEndingOrSpace } from "micromark-util-character";
import { constants, codes } from "micromark-util-symbol";
import type { Code } from "micromark-util-types";
import {
  cjkOrIvs,
  nonEmojiGeneralUseVS,
  unicodePunctuation,
  unicodeWhitespace,
} from "./characterWithNonBmp.js";

export namespace constantsEx {
  export const spaceOrPunctuation = 3 as const;
  export const cjk = 0x1000 as const;
  export const cjkPunctuation = 0x1002 as const;
  export const ivs = 0x2000 as const;
  export const cjkOrIvs = 0x3000 as const;
  export const nonEmojiGeneralUseVS = 0x4000 as const;
  export const variationSelector = 0x7000 as const;
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

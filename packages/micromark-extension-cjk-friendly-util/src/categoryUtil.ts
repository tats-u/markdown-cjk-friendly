import { constants } from "micromark-util-symbol";
import { type classifyCharacter, constantsEx } from "./classifyCharacter.js";

type Category = ReturnType<typeof classifyCharacter>;

/**
 * `true` if the code point represents an [Unicode whitespace character](https://spec.commonmark.org/0.31.2/#unicode-whitespace-character).
 *
 * @param category the return value of `classifyCharacter`.
 * @returns `true` if the code point represents an Unicode whitespace character
 */
export function isUnicodeWhitespace(category: Category): boolean {
  return Boolean(category & constants.characterGroupWhitespace);
}

/**
 * `true` if the code point represents a [non-CJK punctuation character](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#non-cjk-punctuation-character).
 *
 * @param category the return value of `classifyCharacter`.
 * @returns `true` if the code point represents a non-CJK punctuation character
 */
export function isNonCjkPunctuation(category: Category): boolean {
  return (
    (category & constantsEx.cjkPunctuation) ===
    constants.characterGroupPunctuation
  );
}

/**
 * `true` if the code point represents a [CJK character](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#cjk-character).
 *
 * @param category the return value of `classifyCharacter`.
 * @returns `true` if the code point represents a CJK character
 */
export function isCjk(category: Category): boolean {
  return Boolean(category & constantsEx.cjk);
}

/**
 * `true` if the code point represents an [Ideographic Variation Selector](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#ideographi-variation-selector).
 *
 * @param category the return value of `classifyCharacter`.
 * @returns `true` if the code point represents an IVS
 */
export function isIvs(category: Category): boolean {
  // Exclusive with the others
  return category === constantsEx.ivs;
}

/**
 * `true` if the code point represents a [Non-emoji General-use Variation Selector](https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md#non-emoji-general-use-variation-selector).
 *
 * @param category the return value of `classifyCharacter`.
 * @returns `true` if the code point represents an Non-emoji General-use Variation Selector
 */
export function isNonEmojiGeneralUseVS(category: Category): boolean {
  // Exclusive with the others
  return category === constantsEx.nonEmojiGeneralUseVS;
}

/**
 * `true` if the code point represents an [Unicode whitespace character](https://spec.commonmark.org/0.31.2/#unicode-whitespace-character) or an [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character).
 *
 * @param category the return value of `classifyCharacter`.
 * @returns `true` if the code point represents a space or punctuation
 */
export function isSpaceOrPunctuation(category: Category): boolean {
  return Boolean(category & constantsEx.spaceOrPunctuation);
}

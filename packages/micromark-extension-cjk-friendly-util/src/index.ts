export {
  isCjk,
  isCjkOrIvs,
  isIvs,
  isNonCjkPunctuation,
  isNonEmojiGeneralUseVS,
  isSpaceOrPunctuation,
  isUnicodeWhitespace,
} from "./categoryUtil.js";
export {
  classifyCharacter,
  classifyPrecedingCharacter,
  constantsEx,
} from "./classifyCharacter.js";
export {
  isCodeHighSurrogate,
  isCodeLowSurrogate,
  tryGetCodeTwoBefore,
  tryGetGenuineNextCode,
  tryGetGenuinePreviousCode,
  TwoPreviousCode,
} from "./codeUtil.js";

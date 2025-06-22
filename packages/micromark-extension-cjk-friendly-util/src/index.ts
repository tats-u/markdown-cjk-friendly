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
  TwoPreviousCode,
  tryGetCodeTwoBefore,
  tryGetGenuineNextCode,
  tryGetGenuinePreviousCode,
} from "./codeUtil.js";

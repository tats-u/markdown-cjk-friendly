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
  classifyFollowingCharacter,
  classifyPrecedingCharacter,
  constantsEx,
} from "./classifyCharacter.js";
export {
  isCodeHighSurrogate,
  isCodeLowSurrogate,
  TwoPreviousCode,
  tryGetCodeAfterNext,
  tryGetCodeTwoBefore,
  tryGetGenuineNextCode,
  tryGetGenuinePreviousCode,
} from "./codeUtil.js";

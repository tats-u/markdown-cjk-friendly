import type { MarkedExtension, Tokens } from "marked";

// CJK character ranges (Unicode 17, from ranges.md)
// Matches CJK characters by East Asian Width (Wide, Fullwidth, Halfwidth)
// plus Hangul script characters with Neutral width.
// Emoji_Presentation characters overlapping with CJK Wide are excluded.
const CJK =
  "\\u1100-\\u11ff\\u20a9\\u2329-\\u232a\\u2630-\\u2637\\u268a-\\u268f" +
  "\\u2e80-\\u2e99\\u2e9b-\\u2ef3\\u2f00-\\u2fd5\\u2ff0-\\u303e" +
  "\\u3041-\\u3096\\u3099-\\u30ff\\u3105-\\u312f\\u3131-\\u318e" +
  "\\u3190-\\u31e5\\u31ef-\\u321e\\u3220-\\u3247\\u3250-\\ua48c" +
  "\\ua490-\\ua4c6\\ua960-\\ua97c\\uac00-\\ud7a3\\ud7b0-\\ud7c6" +
  "\\ud7cb-\\ud7fb\\uf900-\\ufaff\\ufe10-\\ufe19\\ufe30-\\ufe52" +
  "\\ufe54-\\ufe66\\ufe68-\\ufe6b\\uff01-\\uffbe\\uffc2-\\uffc7" +
  "\\uffca-\\uffcf\\uffd2-\\uffd7\\uffda-\\uffdc\\uffe0-\\uffe6" +
  "\\uffe8-\\uffee" +
  "\\u{16fe0}-\\u{16fe4}\\u{16ff0}-\\u{16ff6}" +
  "\\u{17000}-\\u{18cd5}\\u{18cff}-\\u{18d1e}\\u{18d80}-\\u{18df2}" +
  "\\u{1aff0}-\\u{1aff3}\\u{1aff5}-\\u{1affb}\\u{1affd}-\\u{1affe}" +
  "\\u{1b000}-\\u{1b122}\\u{1b132}\\u{1b150}-\\u{1b152}\\u{1b155}" +
  "\\u{1b164}-\\u{1b167}\\u{1b170}-\\u{1b2fb}" +
  "\\u{1d300}-\\u{1d356}\\u{1d360}-\\u{1d376}" +
  "\\u{1f200}\\u{1f202}\\u{1f210}-\\u{1f219}\\u{1f21b}-\\u{1f22e}" +
  "\\u{1f230}-\\u{1f231}\\u{1f237}\\u{1f23b}" +
  "\\u{1f240}-\\u{1f248}\\u{1f260}-\\u{1f265}" +
  "\\u{20000}-\\u{3fffd}";

// CJK test for single character (used for prevChar check)
const cjkTest = new RegExp(`[${CJK}]`, "u");

// CJK-extended punctuation test for prevChar gate check
// Matches: (not * or _) AND (whitespace or punct/symbol or CJK)
const punctuationCjk = new RegExp(`^((?![*_])[\\s\\p{P}\\p{S}${CJK}])`, "u");

// Build CJK-modified right delimiter regexes
// These treat CJK characters as punctuation-like for flanking detection
function buildRDelimAst(
  punct: string,
  punctSpace: string,
  notPunctSpace: string,
): RegExp {
  return new RegExp(
    "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)" +
      "|[^*]+(?=[^*])" +
      `|(?!\\*)${punct}(\\*+)(?=[\\s]|$)` +
      `|${notPunctSpace}(\\*+)(?!\\*)(?=${punctSpace}|$)` +
      `|(?!\\*)${punctSpace}(\\*+)(?=${notPunctSpace})` +
      `|[\\s](\\*+)(?!\\*)(?=${punct})` +
      `|(?!\\*)${punct}(\\*+)(?!\\*)(?=${punct})` +
      `|${notPunctSpace}(\\*+)(?=${notPunctSpace})`,
    "gu",
  );
}

function buildRDelimUnd(
  punct: string,
  punctSpace: string,
  notPunctSpace: string,
): RegExp {
  return new RegExp(
    "^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)" +
      "|[^_]+(?=[^_])" +
      `|(?!_)${punct}(_+)(?=[\\s]|$)` +
      `|${notPunctSpace}(_+)(?!_)(?=${punctSpace}|$)` +
      `|(?!_)${punctSpace}(_+)(?=${notPunctSpace})` +
      `|[\\s](_+)(?!_)(?=${punct})` +
      `|(?!_)${punct}(_+)(?!_)(?=${punct})`,
    "gu",
  );
}

// Non-GFM CJK-modified patterns (no ~ exception)
const cjkPunct = `[\\p{P}\\p{S}${CJK}]`;
const cjkPunctSpace = `[\\s\\p{P}\\p{S}${CJK}]`;
const cjkNotPunctSpace = `[^\\s\\p{P}\\p{S}${CJK}]`;

// GFM CJK-modified patterns (~ excluded from punct for em/strong)
const cjkPunctGfm = `(?!~)[\\p{P}\\p{S}${CJK}]`;
const cjkPunctSpaceGfm = `(?!~)[\\s\\p{P}\\p{S}${CJK}]`;
const cjkNotPunctSpaceGfm = `(?:[^\\s\\p{P}\\p{S}${CJK}]|~)`;

// Pre-built CJK-modified right delimiter regexes
const emStrongRDelimAstCjk = buildRDelimAst(
  cjkPunct,
  cjkPunctSpace,
  cjkNotPunctSpace,
);
const emStrongRDelimAstCjkGfm = buildRDelimAst(
  cjkPunctGfm,
  cjkPunctSpaceGfm,
  cjkNotPunctSpaceGfm,
);
const emStrongRDelimUndCjk = buildRDelimUnd(
  cjkPunct,
  cjkPunctSpace,
  cjkNotPunctSpace,
);

interface InlineRules {
  emStrongLDelim: RegExp;
  emStrongRDelimAst: RegExp;
  emStrongRDelimUnd: RegExp;
  punctuation: RegExp;
}

interface TokenizerRules {
  inline: InlineRules;
  other: {
    unicodeAlphaNumeric: RegExp;
  };
}

/**
 * Creates a marked extension that makes emphasis markers CJK-friendly.
 *
 * This extension modifies how `*` and `_` emphasis delimiters are detected
 * so that they work correctly adjacent to CJK (Chinese, Japanese, Korean) characters.
 *
 * In standard CommonMark, emphasis delimiters like `**` may not be recognized
 * when adjacent to CJK punctuation, because CJK characters are not classified
 * as Unicode punctuation or whitespace. This extension treats CJK characters
 * as equivalent to punctuation for flanking delimiter detection.
 */
export default function markedCjkFriendly(): MarkedExtension {
  return {
    tokenizer: {
      emStrong(
        this: {
          rules: TokenizerRules;
          lexer: { inlineTokens: (text: string) => Tokens.Generic[] };
        },
        src: string,
        maskedSrc: string,
        prevChar = "",
      ): Tokens.Em | Tokens.Strong | false | undefined {
        const { rules } = this;

        const match = rules.inline.emStrongLDelim.exec(src);
        if (!match) return false;

        // _ can't be between two alphanumerics
        if (match[3] && prevChar.match(rules.other.unicodeAlphaNumeric))
          return false;

        const nextChar = match[1] || match[2] || "";

        // Check previous character for CJK, including SMP and VS
        // marked's prevChar may be a lone low surrogate for SMP chars;
        // recover the full character from maskedSrc
        let prevIsCjk = punctuationCjk.test(prevChar);
        if (!prevIsCjk && prevChar) {
          const prevIdx = maskedSrc.length - src.length;
          if (prevIdx >= 1) {
            let idx = prevIdx - 1;
            let code = maskedSrc.charCodeAt(idx);

            // Handle non-emoji general-use VS (U+FE00..U+FE0E):
            // look through to the character before the VS
            if (code >= 0xfe00 && code <= 0xfe0e && idx >= 1) {
              idx--;
              code = maskedSrc.charCodeAt(idx);
            }

            if ((code & 0xfc00) === 0xdc00 && idx >= 1) {
              // Low surrogate → recover full SMP character
              const cp = maskedSrc.codePointAt(idx - 1);
              if (cp !== undefined && cp > 0xffff) {
                // IVS (U+E0100..U+E01EF) is treated as CJK
                if (cp >= 0xe0100 && cp <= 0xe01ef) {
                  prevIsCjk = true;
                } else {
                  prevIsCjk = cjkTest.test(String.fromCodePoint(cp));
                }
              }
            } else {
              prevIsCjk = cjkTest.test(String.fromCharCode(code));
            }
          }
        }

        // Original: !nextChar || !prevChar || punctuation.exec(prevChar)
        // CJK extension: also allow when prevChar or nextChar is CJK
        if (
          !nextChar ||
          !prevChar ||
          rules.inline.punctuation.exec(prevChar) ||
          prevIsCjk ||
          cjkTest.test(nextChar)
        ) {
          const lLength = [...match[0]].length - 1;
          let rDelim: string | undefined;
          let rLength: number;
          let delimTotal = lLength;
          let midDelimTotal = 0;

          // Select the CJK-modified right delimiter regex
          // Detect GFM mode: GFM regex source includes (?!~) for tilde handling
          const isGfm = rules.inline.emStrongRDelimAst.source.includes("(?!~)");
          let endReg: RegExp;
          if (match[0][0] === "*") {
            endReg = isGfm ? emStrongRDelimAstCjkGfm : emStrongRDelimAstCjk;
          } else {
            endReg = emStrongRDelimUndCjk;
          }
          endReg.lastIndex = 0;

          // Clip maskedSrc to same section of string as src
          const clippedMaskedSrc = maskedSrc.slice(-1 * src.length + lLength);

          let rMatch: RegExpExecArray | null;
          // biome-ignore lint/suspicious/noAssignInExpressions: following marked's pattern
          while ((rMatch = endReg.exec(clippedMaskedSrc)) != null) {
            rDelim =
              rMatch[1] ||
              rMatch[2] ||
              rMatch[3] ||
              rMatch[4] ||
              rMatch[5] ||
              rMatch[6];

            if (!rDelim) continue;

            rLength = [...rDelim].length;

            // Check if CJK is adjacent to this delimiter
            // When CJK is adjacent, Left-only or Right-only
            // should be reclassified as "Both" (Left or Right)
            let isCjkAdjacent = false;
            if (rMatch[1] || rMatch[2] || rMatch[3] || rMatch[4]) {
              const charBefore = String.fromCodePoint(
                // biome-ignore lint/style/noNonNullAssertion: match[0] is always non-empty
                rMatch[0].codePointAt(0)!,
              );
              const afterPos = rMatch.index + rMatch[0].length;
              const charAfter =
                afterPos < clippedMaskedSrc.length
                  ? String.fromCodePoint(
                      // biome-ignore lint/style/noNonNullAssertion: always in range
                      clippedMaskedSrc.codePointAt(afterPos)!,
                    )
                  : "";
              isCjkAdjacent =
                cjkTest.test(charBefore) || cjkTest.test(charAfter);
            }

            if ((rMatch[3] || rMatch[4]) && !isCjkAdjacent) {
              // found another Left Delim (no CJK → stays Left)
              delimTotal += rLength;
              continue;
            }
            if (rMatch[5] || rMatch[6] || isCjkAdjacent) {
              // either Left or Right Delim (or CJK-reclassified as Both)
              if (lLength % 3 && !((lLength + rLength) % 3)) {
                midDelimTotal += rLength;
                continue; // CommonMark Emphasis Rules 9-10
              }
            }

            delimTotal -= rLength;

            if (delimTotal > 0) continue;

            // Remove extra characters. *a*** -> *a*
            rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
            // biome-ignore lint/style/noNonNullAssertion: match[0] is always non-empty
            const firstCp = rMatch[0].codePointAt(0)!;
            const lastCharLength = firstCp > 0xffff ? 2 : 1;
            const raw = src.slice(
              0,
              lLength + rMatch.index + lastCharLength + rLength,
            );

            // Create `em` if smallest delimiter has odd char count
            if (Math.min(lLength, rLength) % 2) {
              const text = raw.slice(1, -1);
              return {
                type: "em",
                raw,
                text,
                tokens: this.lexer.inlineTokens(text),
              };
            }

            // Create 'strong' if smallest delimiter has even char count
            const text = raw.slice(2, -2);
            return {
              type: "strong",
              raw,
              text,
              tokens: this.lexer.inlineTokens(text),
            };
          }
        }
        return undefined;
      },
    },
  };
}

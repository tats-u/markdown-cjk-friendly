import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import path, { basename } from "node:path";
import { posix } from "node:path/posix";
import { Stream } from "node:stream";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

///// load data /////

const unicodePublic = "https://www.unicode.org/Public/";

const getUrlBase = {
  ucd(version: string) {
    return `${unicodePublic}${version}.0/ucd/`;
  },
  // ucdEmoji(version: string) {
  //   return `${unicodePublic}UCD/${version}/emoji/`;
  // },
  emoji(version: string) {
    return `${unicodePublic}emoji/${version}/`;
  },
} as const;

const getDataUrl = {
  eastAsianWidth(version: string) {
    return `${getUrlBase.ucd(version)}EastAsianWidth.txt`;
  },
  scripts(version: string) {
    return `${getUrlBase.ucd(version)}Scripts.txt`;
  },
  standardizedVariants(version: string) {
    return `${getUrlBase.ucd(version)}StandardizedVariants.txt`;
  },
  emojiSequences(version: string) {
    return `${getUrlBase.emoji(version)}emoji-sequences.txt`;
  },
  emojiVariationSequences(version: string) {
    return `${getUrlBase.ucd(version)}emoji/emoji-variation-sequences.txt`;
  },
} as const;

type DataUrl = { [key in keyof typeof getDataUrl]: string };

function mapObjValues<T extends string, U, V>(
  obj: { [key in T]: U },
  fn: (value: U) => V,
): { [key in T]: V } {
  // @ts-ignore
  return Object.fromEntries(
    // @ts-ignore
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );
}

async function mapObjValuesAsync<T extends string, U, V>(
  obj: { [key in T]: U },
  fn: (value: U) => Promise<V>,
): Promise<{ [key in T]: V }> {
  // @ts-ignore
  return Object.fromEntries(
    // @ts-ignore
    await Promise.all(
      // @ts-ignore
      Object.entries(obj).map(async ([key, value]) => [key, await fn(value)]),
    ),
  );
}

function resolveDataUrl(version: string): DataUrl {
  return mapObjValues(getDataUrl, (fn) => fn(version));
}

function completeUnicodeVersion(version: string): string | undefined {
  if (!/^[0-9]/.test(version)) {
    return undefined;
  }
  switch (countDots(version)) {
    case 0:
      return `${version}.0`;
    case 1:
      return version;
    case 2: {
      const [major, minor, patch] = version.split(".", 3);
      if (patch !== "0") {
        return undefined;
      }
      return `${major}.${minor}`;
    }
    default:
      return undefined;
  }

  function countDots(str: string) {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ".") {
        count++;
      }
    }
    return count;
  }
}

const defaultUnicodeVersion = "16";

// Unicode version & output type (conditional expression (&& , || , <=) / Rust match)
const args = parseArgs({
  args: process.argv,
  allowPositionals: true,
  options: {
    "unicode-version": {
      type: "string",
      short: "u",
      default: defaultUnicodeVersion,
    },
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
    "output-lang": {
      type: "string",
      short: "l",
      default: "md",
    },
  },
});

if (args.values.help) {
  const nodeMajorVersion = Number(process.version.slice(1).split(".", 1)[0]);
  const tsWithoutFlag = nodeMajorVersion >= 23;
  console.log(
    `Usage: ${basename(process.argv[0])} ${tsWithoutFlag ? "" : "--experimental-strip-types "}${process.argv[1]} [-u <unicode-version>] [-l <output-type>]

Options:
  -u, --unicode-version   Unicode version (default: ${defaultUnicodeVersion})
  -l, --output-lang       Output type (default: md)
  -h, --help              Show this help message
  
Supporting output types:
  md   Markdown (default) (Alias: markdown, txt, text, plaintext)
  js   JavaScript/TypeScript (Alias: javascript)
  ts   TypeScript (explicit type) (Alias: typescript)
  js-regex JavaScript/TypeScript regex (Alias: ts-regex)
  c    C (C99 or later), C++ (Alias: cpp, cxx, cpp)
  java Java (8 or later)
  rs   Rust (Alias: rust)
  cs   C# (C# 9 or later) (Alias: csharp, c#)
  py   Python (Alias: python)

Note:
  - for C, stdbool.h is required for C99, C11, and C17 (unnecessary for C23 and later)
  - JavaScript regex uses u flag (requires ES2015/ES6 or later).
  `,
  );
  process.exit(0);
}

const unicodeVersion = completeUnicodeVersion(args.values["unicode-version"]);

if (!unicodeVersion) {
  console.error(`Invalid Unicode version: ${args.values["unicode-version"]}`);
  process.exit(1);
}

const dataUrl = resolveDataUrl(unicodeVersion);

const storeDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "unicode_data",
  unicodeVersion,
);
await mkdir(storeDirectory, { recursive: true });

const dataStore = await mapObjValuesAsync(dataUrl, async (url) => {
  const fileName = posix.basename(url);

  const filePath = path.join(storeDirectory, fileName);
  if (!(await tryStat(filePath))?.isFile()) {
    console.info(`${fileName} not found. Downloading from ${url}...`);
    const fetchResult = await fetch(url);
    if (!fetchResult.ok) {
      throw new Error(`Failed to fetch ${url} (${fetchResult.status})`);
    }
    if (fetchResult.body) {
      const writeStream = Stream.Writable.toWeb(createWriteStream(filePath));
      await fetchResult.body.pipeTo(writeStream);
    } else {
      throw new Error(`Failed to fetch ${url} (no body)`);
    }
  }
  return (await readFile(filePath, "utf-8")).split(/\r?\n/);

  async function tryStat(path: string) {
    try {
      return await stat(path);
    } catch (e) {
      return null;
    }
  }
});

function* mapFilter<T, U>(it: Iterable<T>, fn: (value: T) => null | U) {
  for (const value of it) {
    const result = fn(value);
    if (result !== null) {
      yield result;
    }
  }
}

///// data transformation /////

function isCjkEawType(type: string) {
  switch (type) {
    case "W":
    case "F":
    case "H":
      return true;
    default:
      return false;
  }
}

const eawRanges = mapFilter(dataStore.eastAsianWidth, (line) => {
  const re = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s+;\s+([A-Za-z]+)\s/.exec(line);
  if (re) {
    const first = Number.parseInt(re[1], 16);
    const last = re[2] ? Number.parseInt(re[2], 16) : first;
    const type = re[3];
    return { first, last, isCjk: isCjkEawType(type) } as const;
  }
  return null;
}).toArray();

const hangulRanges = mapFilter(dataStore.scripts, (line) => {
  const re = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s+;\s+Hangul\s/.exec(line);
  if (re) {
    const first = Number.parseInt(re[1], 16);
    const last = re[2] ? Number.parseInt(re[2], 16) : first;
    return { first, last } satisfies Range;
  }
  return null;
}).toArray();

const singleCodePointEmojiRanges = mapFilter(
  dataStore.emojiSequences,
  (line) => {
    // Don't include "ABCD FE0F    ;"
    const re = /^([0-9A-F]+)(?:\.\.([0-9A-F]+))?\s+;/.exec(line);
    if (re) {
      const first = Number.parseInt(re[1], 16);
      const last = re[2] ? Number.parseInt(re[2], 16) : first;
      return { first, last } as const;
    }
    return null;
  },
).toArray();

const isCjkTable: (boolean | null)[] = Array.from(
  { length: 0x110000 },
  (_) => null,
);
const unassignedAsCjkRanges: Range[] = mapFilter(
  dataStore.eastAsianWidth,
  function (this: { preambleEnded: boolean }, line: string) {
    if (this.preambleEnded) {
      return null;
    }
    if (/^[0-9A-Fa-f]/.test(line)) {
      this.preambleEnded = true;
      return null;
    }

    if (line[0] !== "#") {
      return null;
    }

    // No default type declarations other than "W" as of Unicode 16
    const reResult = /(?:^#|:)\s+U\+([0-9A-F]+)\.\.U\+([0-9A-F]+)$/.exec(line);
    if (reResult) {
      const first = Number.parseInt(reResult[1], 16);
      const last = Number.parseInt(reResult[2], 16);

      // U+2FFFE & U+2FFFF are Noncharacter; their EAW are undefined
      return { first, last: last === 0x2fffd ? 0x2ffff : last } satisfies Range;
    }

    return null;
  }.bind({ preambleEnded: false }),
).toArray();

// const textSwitchableEmojis: number[] = mapFilter(
//   dataStore.emojiVariationSequences,
//   (line) => {
//     const reResult = /^([0-9A-F]+) FE0E +; /.exec(line);
//     if (reResult) {
//       const cp = Number.parseInt(reResult[1], 16);
//       return cp;
//     }
//     return null;
//   },
// ).toArray();

const emojiSwitchableSymbols: number[] = mapFilter(
  dataStore.emojiVariationSequences,
  (line) => {
    const reResult = /^([0-9A-F]+) FE0F +; /.exec(line);
    if (reResult) {
      const cp = Number.parseInt(reResult[1], 16);
      return cp;
    }
    return null;
  },
).toArray();

///// main process ///

// const cjkDisablingEmojis = new Set<number>();

for (const { first, last, isCjk } of eawRanges) {
  for (let cp = first; cp <= last; ++cp) isCjkTable[cp] = isCjk;
}

for (const { first, last } of singleCodePointEmojiRanges) {
  for (let cp = first; cp <= last; ++cp) {
    // if (isCjkTable[cp]) {
    //   cjkDisablingEmojis.add(cp);
    // }
    isCjkTable[cp] = false;
  }
}

for (const { first, last } of hangulRanges) {
  for (let cp = first; cp <= last; ++cp) isCjkTable[cp] = true;
}

for (const { first, last } of unassignedAsCjkRanges) {
  for (let cp = first; cp <= last; ++cp) {
    if (isCjkTable[cp] === null) isCjkTable[cp] = true;
  }
}

///// variation selector following cjk /////

const variationSelectorSet = new Set<number>();

for (const line of dataStore.standardizedVariants) {
  const re = /^([0-9A-F]+) ([0-9A-F]+); /.exec(line);
  if (!re) continue;
  const primary = Number.parseInt(re[1], 16);
  const vs = Number.parseInt(re[2], 16);
  if (!isCjkTable[primary]) continue;

  variationSelectorSet.add(vs);
}
variationSelectorSet.add(0xfe0e);

const variationSelectorArray = Array.from(variationSelectorSet);
variationSelectorArray.sort((a, b) => a - b);

///// CJK switchable between emoji and text symbol

const cjkSymbolsSwitchableToEmoji: number[] = emojiSwitchableSymbols.filter(
  (cp) => isCjkTable[cp],
);

// const emojisDerivedFromCjkSymbols: number[] = textSwitchableEmojis.filter(
//   (cp) => cjkDisablingEmojis.has(cp),
// );

///// table to ranges /////

interface Range {
  /**
   * First code point of the range
   */
  first: number;
  /**
   * Last code point of the range
   *
   * Can be the same as `first` if the range is a single code point
   *
   * _Never_ be the next code point of the end of the range
   */
  last: number;
}

function rangesFromNullableBooleanArray(isIns: (boolean | null)[]): Range[] {
  const result: Range[] = [];
  let rangeStart: number | null = null;

  for (let cp = 0; cp < isIns.length; ++cp) {
    const isIn = isIns[cp];
    if (isIn) {
      if (rangeStart === null) {
        rangeStart = cp;
      }
    } else if (rangeStart !== null) {
      result.push({ first: rangeStart, last: cp - 1 });
      rangeStart = null;
    }
  }

  if (rangeStart !== null) {
    result.push({ first: rangeStart, last: isIns.length - 1 });
  }

  return result;
}

function rangesFromAscSortedValues(cps: Iterable<number>): Range[] {
  const result: Range[] = [];

  let rangeStart: number | null = null;
  let last: number | null = null;
  for (const cp of cps) {
    if (rangeStart === null) {
      rangeStart = cp;
    } else if (last !== null) {
      if (cp !== last + 1) {
        result.push({ first: rangeStart, last });
        rangeStart = cp;
      }
    }
    last = cp;
  }

  if (rangeStart !== null && last !== null) {
    result.push({ first: rangeStart, last });
  }

  return result;
}

///// output preparation /////

interface StatementBuildInfo {
  /**
   * Produce a string to start the statement from a variable name
   *
   * @param variableName variable name. It can contain e.g. "`bool `".
   * @returns String to start the statement
   */
  prefix: (variableName: string) => string;
  /**
   * String to end the statement (e.g. `;` in C)
   */
  suffix: string;
  /**
   * String to join each range
   *
   * e.g. `||` operator in C
   */
  joiner: string;
  /**
   * Produce a string to represent a single code point
   *
   * @param cp code point number
   * @returns String to represent the code point
   */
  single: (cp: number) => string;
  /**
   * Produce a string to represent a range of multiple code points
   *
   * In programming languages, this is often the combination of `<=` and `&&`
   *
   * @param first first code point of the range
   * @param last last code point of the range
   * @returns String to represent the range
   */
  range: (first: number, last: number) => string;
}

interface VariableNames {
  isCjk: string;
  isSvsFollowingCjk: string;
  isWideIfEawUnassigned: string;
  // emojisDerivedFromCjk: string;
  cjkSymbolsSwitchableToEmoji: string;
}

const snakeCase: VariableNames = {
  isCjk: "is_cjk",
  isSvsFollowingCjk: "is_svs_following_cjk",
  isWideIfEawUnassigned: "is_wide_if_eaw_unassigned",
  cjkSymbolsSwitchableToEmoji: "cjk_symbols_switchable_to_emoji",
  // emojisDerivedFromCjk: "emojis_derived_from_cjk",
};

const camelCase: VariableNames = {
  isCjk: "isCjk",
  isSvsFollowingCjk: "isSvsFollowingCjk",
  isWideIfEawUnassigned: "isWideIfEawUnassigned",
  cjkSymbolsSwitchableToEmoji: "cjkSymbolsSwitchableToEmoji",
  // emojisDerivedFromCjk: "emojisDerivedFromCjk",
};

const markdownCase: VariableNames = {
  isCjk: "CJK code points without variation selector",
  isSvsFollowingCjk: "SVS following CJK code points",
  isWideIfEawUnassigned:
    'EAW is treated as "W" if unassigned (defined by Unicode)',
  cjkSymbolsSwitchableToEmoji:
    "CJK Symbols that can be switched to emoji by U+FE0F",
  // emojisDerivedFromCjk:
  //   "Emojis derived from CJK symbols (can be switched to text symbol by U+FE0E)",
};

type FormatBaseLanguage = "rust" | "c" | "cs" | "py" | "md" | "js-regex";
type Language = FormatBaseLanguage | "java" | "js" | "cpp" | "ts";

function toJsRegexEscape(cp: number) {
  if (cp >= 0x10000) {
    return `\\u{${cp.toString(16)}}`;
  }
  return `\\u${cp.toString(16).padStart(4, "0")}`;
}

const formatType = new Map<FormatBaseLanguage, StatementBuildInfo>([
  [
    "c",
    {
      prefix: (variableName) => `${variableName} = `,
      suffix: ";",
      joiner: "\n  || ",
      single: (cp) => `cp == 0x${cp.toString(16)}`,
      range: (first, last) =>
        `0x${first.toString(16)} <= cp && cp <= 0x${last.toString(16)}`,
    },
  ],
  [
    "cs",
    {
      prefix: (variableName) => `${variableName} =\n    cp is `,
      suffix: ";",
      joiner: "\n    or ",
      single: (cp) => `0x${cp.toString(16)}`,
      range: (first, last) =>
        `>= 0x${first.toString(16)} and <= 0x${last.toString(16)}`,
    },
  ],
  [
    "rust",
    {
      prefix: (variableName) => `${variableName} = matches!(\n    cp,\n    `,
      suffix: "\n);",
      joiner: "\n      | ",
      single: (cp) => `0x${cp.toString(16)}`,
      range: (first, last) =>
        `0x${first.toString(16)}..=0x${last.toString(16)}`,
    },
  ],
  [
    "py",
    {
      prefix: (variableName) => `${variableName} = `,
      suffix: "",
      joiner: " \\\n    or ",
      single: (cp) => `cp == 0x${cp.toString(16)}`,
      range: (first, last) =>
        `0x${first.toString(16)} <= cp <= 0x${last.toString(16)}`,
    },
  ],
  [
    "md",
    {
      prefix: (variableName) => `## ${variableName}\n\n- `,
      suffix: "",
      joiner: "\n- ",
      single: (cp) =>
        `U+${cp.toString(16).toUpperCase().padStart(4, "0")} (${String.fromCodePoint(cp)})`,
      range: (first, last) =>
        `U+${first.toString(16).toUpperCase().padStart(4, "0")}..U+${last.toString(16).toUpperCase().padStart(4, "0")} (${String.fromCodePoint(first)}..${String.fromCodePoint(last)})`,
    },
  ],
  [
    "js-regex",
    {
      prefix: (variableName) => `${variableName}Regex = /^[`,
      suffix: "]/u;",
      joiner: "",
      single: toJsRegexEscape,
      range: (first, last) =>
        `${toJsRegexEscape(first)}-${toJsRegexEscape(last)}`,
    },
  ],
]);

const variableNamesMap = new Map<Language, VariableNames>([
  ["c", snakeCase],
  ["cs", camelCase],
  ["java", camelCase],
  ["rust", snakeCase],
  ["js", camelCase],
  ["js-regex", camelCase],
  ["py", snakeCase],
  ["md", markdownCase],
]);

const newVariableMap = new Map<Language, (variableName: string) => string>([
  ["c", (v) => `const bool ${v}`],
  ["cs", (v) => `var ${v}`],
  ["java", (v) => `final var ${v}`],
  ["rust", (v) => `let ${v}`],
  ["js", (v) => `const ${v}`],
  ["js-regex", (v) => `const ${v}`],
  ["ts", (v) => `const ${v}: boolean`],
  ["py", (v) => v],
  ["md", (v) => v],
]);

const langAlias = new Map<string, Language>([
  ["c++", "cpp"],
  ["cxx", "cpp"],
  ["javascript", "js"],
  ["typescript", "ts"],
  ["ts-regex", "js-regex"],
  ["c#", "cs"],
  ["csharp", "cs"],
  ["rs", "rust"],
  ["python", "py"],
  ["txt", "md"],
  ["text", "md"],
  ["plaintext", "md"],
  ["markdown", "md"],
]);

const formatAlias = new Map<
  Exclude<Language, FormatBaseLanguage>,
  FormatBaseLanguage
>([
  ["cpp", "c"],
  ["js", "c"],
  ["ts", "c"],
  ["java", "c"],
]);

interface FormatSet {
  format: StatementBuildInfo;
  variableNames: VariableNames;
  newVariable: (variableName: string) => string;
}

function getPrintRanges({ format, variableNames, newVariable }: FormatSet) {
  return (ranges: Range[], variableName: keyof VariableNames) =>
    `${format.prefix(newVariable(variableNames[variableName]))}${ranges
      .map(({ first, last }) =>
        first !== last ? format.range(first, last) : format.single(first),
      )
      .join(format.joiner)}${format.suffix}`;
}

///// output /////

let lang =
  (args.values["output-lang"]?.toLowerCase() as Language | undefined) ?? "md";
lang = langAlias.get(lang) ?? lang;
let formatLang =
  // @ts-expect-error
  formatAlias.get(lang) ?? (lang as FormatBaseLanguage);
if (!formatType.has(formatLang)) {
  lang = "md";
  formatLang = "md";
}
const format =
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  formatType.get(formatLang)!;
const variableNames =
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  variableNamesMap.get(lang) ?? variableNamesMap.get(formatLang)!;
const newVariable =
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  newVariableMap.get(lang) ?? newVariableMap.get(formatLang)!;
const formatSet: FormatSet = { format, variableNames, newVariable };

const printRanges = getPrintRanges(formatSet);

console.log(printRanges(rangesFromNullableBooleanArray(isCjkTable), "isCjk"));
console.log();
console.log(
  printRanges(
    rangesFromAscSortedValues(variationSelectorArray),
    "isSvsFollowingCjk",
  ),
);
if (formatLang === "md") {
  console.log();
  console.log(printRanges(unassignedAsCjkRanges, "isWideIfEawUnassigned"));
  console.log();
  console.log(
    printRanges(
      rangesFromAscSortedValues(cjkSymbolsSwitchableToEmoji),
      "cjkSymbolsSwitchableToEmoji",
    ),
  );
  // console.log();
  // console.log(
  //   printRanges(
  //     rangesFromAscSortedValues(emojisDerivedFromCjkSymbols),
  //     "emojisDerivedFromCjk",
  //   ),
  // );
}

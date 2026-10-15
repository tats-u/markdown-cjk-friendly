import {
  classifyCharacter,
  classifyPrecedingCharacter,
  isCjk,
  isCjkOrIvs,
  isNonCjkPunctuation,
  isNonEmojiGeneralUseVS,
  isSpaceOrPunctuation,
  isUnicodeWhitespace,
} from "micromark-extension-cjk-friendly-util";
import { classifyCharacter as classifyCommonMark } from "micromark-util-classify-character";

type EncodeSides = { inside: boolean; outside: boolean };
type Kind = ReturnType<typeof classifyCharacter>;

export function firstCharacter(value: string): string {
  return value[Symbol.iterator]().next().value ?? "";
}

export function lastCharacter(value: string, end = value.length): string {
  if (end === 0) return "";
  const lastCodeUnit = value.charCodeAt(end - 1);
  if (
    lastCodeUnit < 0xdc00 ||
    lastCodeUnit >= 0xe000 ||
    end === 1 ||
    (value.codePointAt(end - 2) ?? 0) < 0x10000
  ) {
    // biome-ignore lint/style/noNonNullAssertion: end points just after a character
    return value[end - 1]!;
  }
  return value.slice(end - 2, end);
}

function classifyBefore(value: string): Kind {
  const character = lastCharacter(value);
  const current = character.codePointAt(0) ?? null;
  const kind = classifyCharacter(current);
  return current !== null && isNonEmojiGeneralUseVS(kind)
    ? classifyPrecedingCharacter(
        kind,
        () =>
          lastCharacter(value, value.length - character.length).codePointAt(
            0,
          ) ?? null,
        current,
      )
    : kind;
}

function sides(before: Kind, after: Kind, marker: string) {
  const beforePunctuation = isNonCjkPunctuation(before);
  const afterPunctuation = isNonCjkPunctuation(after);
  const beforeSpaceOrPunctuation =
    beforePunctuation || isUnicodeWhitespace(before);
  const afterSpaceOrPunctuation =
    afterPunctuation || isUnicodeWhitespace(after);
  const open =
    !afterSpaceOrPunctuation ||
    (afterPunctuation && (beforeSpaceOrPunctuation || isCjkOrIvs(before)));
  const close =
    !beforeSpaceOrPunctuation ||
    (beforePunctuation && (afterSpaceOrPunctuation || isCjk(after)));
  return {
    open:
      marker === "_" ? open && (isSpaceOrPunctuation(before) || !close) : open,
    close:
      marker === "_" ? close && (isSpaceOrPunctuation(after) || !open) : close,
  };
}

export function attentionSides(
  before: string,
  after: string,
  marker: string,
  cjk: boolean,
): { open: boolean; close: boolean } {
  if (cjk) {
    return sides(
      classifyBefore(before),
      classifyCharacter(after.codePointAt(0) ?? null),
      marker,
    );
  }
  const previous = classifyCommonMark(
    lastCharacter(before).codePointAt(0) ?? null,
  );
  const next = classifyCommonMark(after.codePointAt(0) ?? null);
  const open = !next || (next === 2 && Boolean(previous));
  const close = !previous || (previous === 2 && Boolean(next));
  return {
    open: marker === "_" ? open && (Boolean(previous) || !close) : open,
    close: marker === "_" ? close && (Boolean(next) || !open) : close,
  };
}

function fallback(
  outside: number | undefined,
  inside: number | undefined,
  marker: string,
): EncodeSides {
  if (outside === undefined) {
    return inside === undefined
      ? { inside: marker === "_", outside: marker === "_" }
      : inside === 1
        ? { inside: true, outside: true }
        : { inside: false, outside: true };
  }
  if (outside === 1) {
    return { inside: inside === 1, outside: inside === 1 };
  }
  return { inside: inside === 1, outside: false };
}

/** Choose boundary encodings without changing punctuation used by constructs. */
export function encodeInfo(
  before: string,
  after: string,
  marker: string,
  opening: boolean,
  cjk: boolean,
): EncodeSides {
  const beforeKind = classifyBefore(before);
  const afterKind = classifyCharacter(after.codePointAt(0) ?? null);
  if (!cjk || (!isCjkOrIvs(beforeKind) && !isCjkOrIvs(afterKind))) {
    const previous = cjk
      ? commonMarkKind(beforeKind)
      : classifyCommonMark(lastCharacter(before).codePointAt(0) ?? null);
    const next = cjk
      ? commonMarkKind(afterKind)
      : classifyCommonMark(after.codePointAt(0) ?? null);
    return opening
      ? fallback(previous, next, marker)
      : fallback(next, previous, marker);
  }
  const candidates: EncodeSides[] = [
    { inside: false, outside: false },
    { inside: true, outside: false },
    { inside: false, outside: true },
    { inside: true, outside: true },
  ];
  for (const candidate of candidates) {
    const encodedBefore = opening ? candidate.outside : candidate.inside;
    const encodedAfter = opening ? candidate.inside : candidate.outside;
    const forms = sides(
      encodedBefore
        ? classifyCharacter(";".codePointAt(0) ?? null)
        : beforeKind,
      encodedAfter ? classifyCharacter("&".codePointAt(0) ?? null) : afterKind,
      marker,
    );
    if (opening ? forms.open : forms.close) return candidate;
  }
  return { inside: true, outside: true };
}

function commonMarkKind(kind: Kind): number | undefined {
  return isUnicodeWhitespace(kind)
    ? 1
    : isNonCjkPunctuation(kind)
      ? 2
      : undefined;
}

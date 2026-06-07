import type { Emphasis, Parents, Strong, Text } from "mdast";
import type { Info, Options, State } from "mdast-util-to-markdown";
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
import { codes } from "micromark-util-symbol";

type AttentionMarker = "*" | "_";
type AttentionNode = Emphasis | Strong;
type EncodeSides = {
  inside: boolean;
  outside: boolean;
};
type EncodeTarget = "open" | "close";
type BoundaryContext = {
  current: number | null;
  previous: number | null;
};
type CjkFriendlyState = State & {
  cjkFriendlyEncodeAfterSupplementaryText?: boolean;
};

const encodedOutsideBoundary = ";".codePointAt(0) ?? codes.eof;
const encodedInsideBoundary = "&".codePointAt(0) ?? codes.eof;

/**
 * Add CJK-friendly `toMarkdown` handlers for emphasis and strong.
 */
export function cjkFriendlyToMarkdown(): Options {
  return {
    handlers: {
      emphasis,
      strong,
      text,
    },
  };
}

emphasis.peek = emphasisPeek;
strong.peek = strongPeek;

function emphasis(
  node: Emphasis,
  parent: Parents | undefined,
  state: State,
  info: Info,
): string {
  return serializeAttention(
    node,
    parent,
    state,
    info,
    emphasisPeek(node, parent, state),
    1,
  );
}

function strong(
  node: Strong,
  parent: Parents | undefined,
  state: State,
  info: Info,
): string {
  return serializeAttention(
    node,
    parent,
    state,
    info,
    strongPeek(node, parent, state),
    2,
  );
}

function emphasisPeek(
  _: Emphasis,
  _parent: Parents | undefined,
  state: State,
): AttentionMarker {
  return state.options.emphasis || "*";
}

function strongPeek(
  _: Strong,
  _parent: Parents | undefined,
  state: State,
): AttentionMarker {
  return state.options.strong || "*";
}

function serializeAttention(
  node: AttentionNode,
  parent: Parents | undefined,
  state: State,
  info: Info,
  marker: AttentionMarker,
  size: 1 | 2,
): string {
  const sequence = marker.repeat(size);
  const exit = state.enter(size === 1 ? "emphasis" : "strong");
  const tracker = state.createTracker(info);
  const before = tracker.move(sequence);

  let between = tracker.move(
    state.containerPhrasing(node, {
      after: marker,
      before,
      ...tracker.current(),
    }),
  );

  const beforeBoundary = resolveBeforeBoundary(
    node,
    parent,
    state,
    info.before,
  );
  const afterBoundary = resolveAfterBoundary(node, parent, state, info.after);

  const open = encodeInfoCjk(
    beforeBoundary,
    firstCodePoint(between),
    marker,
    "open",
  );
  if (open.inside && between) {
    between = encodeFirstCodePoint(between);
  }

  const close = encodeInfoCjk(
    {
      current: lastCodePoint(between),
      previous: codePointBeforeLast(between),
    },
    afterBoundary,
    marker,
    "close",
  );
  if (close.inside && between) {
    between = encodeLastCodePoint(between);
  }

  const after = tracker.move(sequence);

  exit();

  const encodeAfterSupplementary =
    close.outside && shouldEncodeAfterSupplementaryText(parent, state);

  state.attentionEncodeSurroundingInfo = {
    after: close.outside && !encodeAfterSupplementary,
    before: open.outside,
  };
  getCjkFriendlyState(state).cjkFriendlyEncodeAfterSupplementaryText =
    encodeAfterSupplementary;

  return before + between + after;
}

function text(
  node: Text,
  _parent: Parents | undefined,
  state: State,
  info: Info,
): string {
  const cjkFriendlyState = getCjkFriendlyState(state);

  if (!cjkFriendlyState.cjkFriendlyEncodeAfterSupplementaryText) {
    return state.safe(node.value, info);
  }

  // Temporary workaround for https://github.com/syntax-tree/mdast-util-to-markdown/issues/68:
  // mdast-util-to-markdown encodes only the first UTF-16 code unit of the following text node.
  cjkFriendlyState.cjkFriendlyEncodeAfterSupplementaryText = false;

  const [first = ""] = [...node.value];
  const rest = node.value.slice(first.length);

  return `${encodeCharacterReference(first.codePointAt(0) ?? codes.eof)}${state.safe(
    rest,
    {
      ...info,
      before: ";",
    },
  )}`;
}

// Based on mdast-util-to-markdown's strong/emphasis handlers and encode-info.js,
// but with CJK-aware opening/closing checks that match this repository's parser.
function encodeInfoCjk(
  before: BoundaryContext,
  after: number | null,
  marker: AttentionMarker,
  target: EncodeTarget,
): EncodeSides {
  const beforeKind = classifyBoundaryBefore(before);
  const afterKind = classifyCharacter(after);

  if (!isCjkOrIvs(beforeKind) && !isCjkOrIvs(afterKind)) {
    return target === "open"
      ? encodeInfoFallback(beforeKind, afterKind, marker)
      : encodeInfoFallback(afterKind, beforeKind, marker);
  }

  const raw: EncodeSides = { inside: false, outside: false };
  const preserveOutside: EncodeSides = { inside: true, outside: false };
  const preserveInside: EncodeSides = { inside: false, outside: true };
  const encodeBoth: EncodeSides = { inside: true, outside: true };

  for (const candidate of [raw, preserveOutside, preserveInside, encodeBoth]) {
    const candidateBefore =
      target === "open"
        ? candidate.outside
          ? encodedBoundaryBeforeContext
          : before
        : candidate.inside
          ? encodedBoundaryBeforeContext
          : before;
    const candidateAfter =
      target === "open"
        ? candidate.inside
          ? encodedBoundaryAfter
          : after
        : candidate.outside
          ? encodedBoundaryAfter
          : after;
    const forms =
      target === "open"
        ? canOpen(marker, candidateBefore, candidateAfter)
        : canClose(marker, candidateBefore, candidateAfter);

    if (forms) {
      return candidate;
    }
  }

  return encodeBoth;
}

function encodeInfoFallback(
  outsideKind: ReturnType<typeof classifyCharacter>,
  insideKind: ReturnType<typeof classifyCharacter>,
  marker: AttentionMarker,
): EncodeSides {
  if (isLetterLike(outsideKind)) {
    return isLetterLike(insideKind)
      ? marker === "_"
        ? { inside: true, outside: true }
        : { inside: false, outside: false }
      : isUnicodeWhitespace(insideKind)
        ? { inside: true, outside: true }
        : { inside: false, outside: true };
  }

  if (isUnicodeWhitespace(outsideKind)) {
    return isLetterLike(insideKind)
      ? { inside: false, outside: false }
      : isUnicodeWhitespace(insideKind)
        ? { inside: true, outside: true }
        : { inside: false, outside: false };
  }

  return isUnicodeWhitespace(insideKind)
    ? { inside: true, outside: false }
    : { inside: false, outside: false };
}

function canOpen(
  marker: AttentionMarker,
  before: BoundaryContext,
  afterCode: number | null,
): boolean {
  const beforeKind = classifyBoundaryBefore(before);
  const { close, open } = getAttentionSides(
    beforeKind,
    classifyCharacter(afterCode),
  );

  return marker === "_"
    ? open && (isSpaceOrPunctuation(beforeKind) || !close)
    : open;
}

function canClose(
  marker: AttentionMarker,
  before: BoundaryContext,
  afterCode: number | null,
): boolean {
  const afterKind = classifyCharacter(afterCode);
  const { close, open } = getAttentionSides(
    classifyBoundaryBefore(before),
    afterKind,
  );

  return marker === "_"
    ? close && (isSpaceOrPunctuation(afterKind) || !open)
    : close;
}

function getAttentionSides(
  beforeKind: ReturnType<typeof classifyCharacter>,
  afterKind: ReturnType<typeof classifyCharacter>,
): { close: boolean; open: boolean } {
  const beforeNonCjkPunctuation = isNonCjkPunctuation(beforeKind);
  const beforeSpaceOrNonCjkPunctuation =
    beforeNonCjkPunctuation || isUnicodeWhitespace(beforeKind);
  const afterNonCjkPunctuation = isNonCjkPunctuation(afterKind);
  const afterSpaceOrNonCjkPunctuation =
    afterNonCjkPunctuation || isUnicodeWhitespace(afterKind);

  return {
    open:
      !afterSpaceOrNonCjkPunctuation ||
      (afterNonCjkPunctuation &&
        (beforeSpaceOrNonCjkPunctuation || isCjkOrIvs(beforeKind))),
    close:
      !beforeSpaceOrNonCjkPunctuation ||
      (beforeNonCjkPunctuation &&
        (afterSpaceOrNonCjkPunctuation || isCjk(afterKind))),
  };
}

function isLetterLike(kind: ReturnType<typeof classifyCharacter>): boolean {
  return !isUnicodeWhitespace(kind) && !isNonCjkPunctuation(kind);
}

function classifyBoundaryBefore(
  before: BoundaryContext,
): ReturnType<typeof classifyCharacter> {
  const kind = classifyCharacter(before.current);

  return before.current === null || !isNonEmojiGeneralUseVS(kind)
    ? kind
    : classifyPrecedingCharacter(kind, () => before.previous, before.current);
}

function resolveBeforeBoundary(
  node: AttentionNode,
  parent: Parents | undefined,
  state: State,
  fallback: string,
): BoundaryContext {
  let current = lastCodePoint(fallback);
  let previous = codePointBeforeLast(fallback);

  if (
    needsPreviousBoundaryRecovery(current) ||
    needsPreviousContext(current, previous)
  ) {
    const siblingText = getAdjacentSiblingText(node, parent, state, -1);

    if (siblingText) {
      current = lastCodePoint(siblingText);
      previous = codePointBeforeLast(siblingText);
    }
  }

  return { current, previous };
}

function resolveAfterBoundary(
  node: AttentionNode,
  parent: Parents | undefined,
  state: State,
  fallback: string,
): number | null {
  const current = firstCodePoint(fallback);

  if (!needsNextBoundaryRecovery(current)) {
    return current;
  }

  const siblingText = getAdjacentSiblingText(node, parent, state, 1);

  return siblingText ? firstCodePoint(siblingText) : current;
}

function needsPreviousBoundaryRecovery(codePoint: number | null): boolean {
  return codePoint !== null && 0xdc00 <= codePoint && codePoint <= 0xdfff;
}

function needsNextBoundaryRecovery(codePoint: number | null): boolean {
  return codePoint !== null && 0xd800 <= codePoint && codePoint <= 0xdbff;
}

function needsPreviousContext(
  current: number | null,
  previous: number | null,
): boolean {
  return (
    isNonEmojiGeneralUseVS(classifyCharacter(current)) &&
    (previous === null || previous === codes.eof)
  );
}

function getAdjacentSiblingText(
  node: AttentionNode,
  parent: Parents | undefined,
  state: State,
  offset: -1 | 1,
): string | undefined {
  if (!parent) {
    return undefined;
  }

  const stackIndex = state.indexStack.at(-1);
  const siblings = parent.children as readonly AttentionNode[];
  const index =
    typeof stackIndex === "number" ? stackIndex : siblings.indexOf(node);
  if (index < 0) {
    return undefined;
  }

  const sibling = siblings[index + offset];
  const text = getNodeTextContent(sibling);

  return text || undefined;
}

function shouldEncodeAfterSupplementaryText(
  parent: Parents | undefined,
  state: State,
): boolean {
  if (!parent) {
    return false;
  }

  const stackIndex = state.indexStack.at(-1);
  if (typeof stackIndex !== "number") {
    return false;
  }

  const sibling = parent.children[stackIndex + 1];

  return (
    sibling?.type === "text" && (firstCodePoint(sibling.value) ?? 0) > 0xffff
  );
}

function getCjkFriendlyState(state: State): CjkFriendlyState {
  return state as CjkFriendlyState;
}

function getNodeTextContent(node: unknown): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }

  if ("alt" in node && typeof node.alt === "string") {
    return node.alt;
  }

  if ("children" in node && Array.isArray(node.children)) {
    return node.children.map(getNodeTextContent).join("");
  }

  return "";
}

function encodeCharacterReference(codePoint: number | null): string {
  return `&#x${(codePoint ?? 0).toString(16).toUpperCase()};`;
}

function encodeFirstCodePoint(value: string): string {
  const [first = ""] = [...value];
  return (
    encodeCharacterReference(first.codePointAt(0) ?? codes.eof) +
    value.slice(first.length)
  );
}

function encodeLastCodePoint(value: string): string {
  const characters = [...value];
  const last = characters.pop();

  return `${characters.join("")}${encodeCharacterReference(last?.codePointAt(0) ?? codes.eof)}`;
}

function codePointBeforeLast(value: string): number | null {
  const characters = [...value];

  characters.pop();

  return characters.at(-1)?.codePointAt(0) ?? codes.eof;
}

function firstCodePoint(value: string): number | null {
  return value.codePointAt(0) ?? codes.eof;
}

function lastCodePoint(value: string): number | null {
  const last = [...value].at(-1);
  return last?.codePointAt(0) ?? codes.eof;
}

const encodedBoundaryBeforeContext: BoundaryContext = {
  current: encodedOutsideBoundary,
  previous: codes.eof,
};
const encodedBoundaryAfter = encodedInsideBoundary;

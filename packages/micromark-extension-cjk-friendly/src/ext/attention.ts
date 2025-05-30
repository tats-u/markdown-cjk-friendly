import type {
  Code,
  Construct,
  Effects,
  Event,
  Point,
  Resolver,
  State,
  Token,
  TokenizeContext,
  Tokenizer,
} from "micromark-util-types";

import { ok as assert } from "devlop";
import {
  classifyCharacter,
  classifyPrecedingCharacter,
  isCjk,
  isCjkOrIvs,
  isCodeHighSurrogate,
  isCodeLowSurrogate,
  isNonCjkPunctuation,
  isSpaceOrPunctuation,
  isUnicodeWhitespace,
  tryGetGenuineNextCode,
  tryGetGenuinePreviousCode,
} from "micromark-extension-cjk-friendly-util";
import { TwoPreviousCode } from "micromark-extension-cjk-friendly-util";
import { push, splice } from "micromark-util-chunked";
import { resolveAll } from "micromark-util-resolve-all";
import { codes, types } from "micromark-util-symbol";

export const attention: Construct = {
  name: "attention",
  resolveAll: resolveAllAttention,
  tokenize: tokenizeAttention,
};

// eslint-disable-next-line complexity
function resolveAllAttention(
  events: Parameters<Resolver>[0],
  context: Parameters<Resolver>[1],
): ReturnType<Resolver> {
  let index = -1;
  let open: number;
  let group: Token;
  let text: Token;
  let openingSequence: Token;
  let closingSequence: Token;
  let use: number;
  let nextEvents: Event[];
  let offset: number;

  // Walk through all events.
  //
  // Note: performance of this is fine on an mb of normal markdown, but it’s
  // a bottleneck for malicious stuff.
  while (++index < events.length) {
    // Find a token that can close.
    if (
      events[index][0] === "enter" &&
      events[index][1].type === "attentionSequence" &&
      events[index][1]._close
    ) {
      open = index;

      // Now walk back to find an opener.
      while (open--) {
        // Find a token that can open the closer.
        if (
          events[open][0] === "exit" &&
          events[open][1].type === "attentionSequence" &&
          events[open][1]._open &&
          // If the markers are the same:
          context.sliceSerialize(events[open][1]).charCodeAt(0) ===
            context.sliceSerialize(events[index][1]).charCodeAt(0)
        ) {
          // If the opening can close or the closing can open,
          // and the close size *is not* a multiple of three,
          // but the sum of the opening and closing size *is* multiple of three,
          // then don’t match.
          if (
            (events[open][1]._close || events[index][1]._open) &&
            (events[index][1].end.offset - events[index][1].start.offset) % 3 &&
            !(
              (events[open][1].end.offset -
                events[open][1].start.offset +
                events[index][1].end.offset -
                events[index][1].start.offset) %
              3
            )
          ) {
            continue;
          }

          // Number of markers to use from the sequence.
          use =
            events[open][1].end.offset - events[open][1].start.offset > 1 &&
            events[index][1].end.offset - events[index][1].start.offset > 1
              ? 2
              : 1;

          const start = { ...events[open][1].end };
          const end = { ...events[index][1].start };
          movePoint(start, -use);
          movePoint(end, use);

          openingSequence = {
            type: use > 1 ? types.strongSequence : types.emphasisSequence,
            start,
            end: { ...events[open][1].end },
          };
          closingSequence = {
            type: use > 1 ? types.strongSequence : types.emphasisSequence,
            start: { ...events[index][1].start },
            end,
          };
          text = {
            type: use > 1 ? types.strongText : types.emphasisText,
            start: { ...events[open][1].end },
            end: { ...events[index][1].start },
          };
          group = {
            type: use > 1 ? types.strong : types.emphasis,
            start: { ...openingSequence.start },
            end: { ...closingSequence.end },
          };

          events[open][1].end = { ...openingSequence.start };
          events[index][1].start = { ...closingSequence.end };

          nextEvents = [];

          // If there are more markers in the opening, add them before.
          if (events[open][1].end.offset - events[open][1].start.offset) {
            nextEvents = push(nextEvents, [
              ["enter", events[open][1], context],
              ["exit", events[open][1], context],
            ]);
          }

          // Opening.
          nextEvents = push(nextEvents, [
            ["enter", group, context],
            ["enter", openingSequence, context],
            ["exit", openingSequence, context],
            ["enter", text, context],
          ]);

          // Always populated by defaults.
          assert(
            context.parser.constructs.insideSpan.null,
            "expected `insideSpan` to be populated",
          );

          // Between.
          nextEvents = push(
            nextEvents,
            resolveAll(
              context.parser.constructs.insideSpan.null,
              events.slice(open + 1, index),
              context,
            ),
          );

          // Closing.
          nextEvents = push(nextEvents, [
            ["exit", text, context],
            ["enter", closingSequence, context],
            ["exit", closingSequence, context],
            ["exit", group, context],
          ]);

          // If there are more markers in the closing, add them after.
          if (events[index][1].end.offset - events[index][1].start.offset) {
            offset = 2;
            nextEvents = push(nextEvents, [
              ["enter", events[index][1], context],
              ["exit", events[index][1], context],
            ]);
          } else {
            offset = 0;
          }

          splice(events, open - 1, index - open + 3, nextEvents);

          index = open + nextEvents.length - offset - 2;
          break;
        }
      }
    }
  }

  // Remove remaining sequences.
  index = -1;

  while (++index < events.length) {
    if (events[index][1].type === "attentionSequence") {
      events[index][1].type = "data";
    }
  }

  return events;
}

/**
 * @this {TokenizeContext}
 *   Context.
 * @type {Tokenizer}
 */
function tokenizeAttention(
  this: TokenizeContext,
  effects: Effects,
  ok: State,
): State {
  const attentionMarkers = this.parser.constructs.attentionMarkers.null;
  const { now, sliceSerialize, previous: tentativePrevious } = this;
  const previous = isCodeLowSurrogate(tentativePrevious)
    ? // second (lower) surrogate likely to be preceded by first (higher) surrogate
      tryGetGenuinePreviousCode(tentativePrevious, now(), sliceSerialize)
    : tentativePrevious;

  const before = classifyCharacter(previous);
  // biome-ignore lint/style/noNonNullAssertion: null = EOF, but never be
  const twoPrevious = new TwoPreviousCode(previous!, now(), sliceSerialize);
  const beforePrimary = classifyPrecedingCharacter(
    before,
    twoPrevious.value.bind(twoPrevious),
    previous,
  );

  /** @type {NonNullable<Code>} */
  let marker: NonNullable<Code>;

  return start;

  /**
   * Before a sequence.
   *
   * ```markdown
   * > | **
   *     ^
   * ```
   *
   * @type {State}
   */
  function start(code: Code): State | undefined {
    assert(
      code === codes.asterisk || code === codes.underscore,
      "expected asterisk or underscore",
    );
    marker = code;
    effects.enter("attentionSequence");
    return inside(code);
  }

  /**
   * In a sequence.
   *
   * ```markdown
   * > | **
   *     ^^
   * ```
   *
   * @type {State}
   */
  function inside(code: Code): State | undefined {
    if (code === marker) {
      effects.consume(code);
      return inside;
    }

    const token = effects.exit("attentionSequence");

    // To do: next major: move these to resolver, just like `markdown-rs`.
    const next = isCodeHighSurrogate(code)
      ? tryGetGenuineNextCode(code, now(), sliceSerialize)
      : code;

    const after = classifyCharacter(next);

    // Always populated by defaults.
    assert(attentionMarkers, "expected `attentionMarkers` to be populated");

    const beforeNonCjkPunctuation = isNonCjkPunctuation(beforePrimary);
    const beforeSpaceOrNonCjkPunctuation =
      beforeNonCjkPunctuation || isUnicodeWhitespace(beforePrimary);
    const afterNonCjkPunctuation = isNonCjkPunctuation(after);
    const afterSpaceOrNonCjkPunctuation =
      afterNonCjkPunctuation || isUnicodeWhitespace(after);
    const beforeCjkOrIvs = isCjkOrIvs(beforePrimary);

    const open =
      !afterSpaceOrNonCjkPunctuation ||
      (afterNonCjkPunctuation &&
        (beforeSpaceOrNonCjkPunctuation || beforeCjkOrIvs)) ||
      attentionMarkers.includes(code);
    const close =
      !beforeSpaceOrNonCjkPunctuation ||
      (beforeNonCjkPunctuation &&
        (afterSpaceOrNonCjkPunctuation || isCjk(after))) ||
      attentionMarkers.includes(previous);

    token._open = Boolean(
      marker === codes.asterisk
        ? open
        : open && (isSpaceOrPunctuation(beforePrimary) || !close),
    );
    token._close = Boolean(
      marker === codes.asterisk
        ? close
        : close && (isSpaceOrPunctuation(after) || !open),
    );
    return ok(code);
  }
}

/**
 * Move a point a bit.
 *
 * Note: `move` only works inside lines! It’s not possible to move past other
 * chunks (replacement characters, tabs, or line endings).
 *
 * @param {Point} point
 *   Point.
 * @param {number} offset
 *   Amount to move.
 * @returns {undefined}
 *   Nothing.
 */
function movePoint(point: Point, offset: number): void {
  point.column += offset;
  point.offset += offset;
  point._bufferIndex += offset;
}

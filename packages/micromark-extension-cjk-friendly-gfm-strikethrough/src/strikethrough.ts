import type {
  Code,
  Effects,
  Event,
  Extension,
  Resolver,
  State,
  Token,
  TokenType,
  TokenizeContext,
  Tokenizer,
} from "micromark-util-types";

import { ok as assert } from "devlop";
import {
  classifyCharacter,
  isCjk,
  isCodeHighSurrogate,
  isCodeLowSurrogate,
  isIvs,
  isNonCjkPunctuation,
  isSvsFollowingCjk,
  isUnicodeWhitespace,
  tryGetCodeTwoBefore,
  tryGetGenuineNextCode,
  tryGetGenuinePreviousCode,
} from "micromark-extension-cjk-friendly-util";
import { splice } from "micromark-util-chunked";
import { resolveAll } from "micromark-util-resolve-all";
import { constants, codes, types } from "micromark-util-symbol";

export interface Options {
  singleTilde?: boolean;
}

/**
 * Create an extension for `micromark` to enable GFM strikethrough syntax.
 *
 * @param {Options | null | undefined} [options={}]
 *   Configuration.
 * @returns {Extension}
 *   Extension for `micromark` that can be passed in `extensions`, to
 *   enable GFM strikethrough syntax.
 */
export function gfmStrikethroughCjkFriendly(
  options?: Options | null | undefined,
): Extension {
  const options_ = options || {};
  let single = options_.singleTilde;
  const tokenizer = {
    name: "strikethrough" as TokenType,
    tokenize: tokenizeStrikethrough,
    resolveAll: resolveAllStrikethrough,
  };

  if (single === null || single === undefined) {
    single = true;
  }

  return {
    text: { [codes.tilde]: tokenizer },
    insideSpan: { null: [tokenizer] },
    attentionMarkers: { null: [codes.tilde] },
  };

  /**
   * Take events and resolve strikethrough.
   *
   * @type {Resolver}
   */
  function resolveAllStrikethrough(
    events: Event[],
    context: TokenizeContext,
  ): Event[] {
    let index = -1;

    // Walk through all events.
    while (++index < events.length) {
      // Find a token that can close.
      if (
        events[index][0] === "enter" &&
        events[index][1].type ===
          ("strikethroughSequenceTemporary" as TokenType) &&
        events[index][1]._close
      ) {
        let open = index;

        // Now walk back to find an opener.
        while (open--) {
          // Find a token that can open the closer.
          if (
            events[open][0] === "exit" &&
            events[open][1].type ===
              ("strikethroughSequenceTemporary" as TokenType) &&
            events[open][1]._open &&
            // If the sizes are the same:
            events[index][1].end.offset - events[index][1].start.offset ===
              events[open][1].end.offset - events[open][1].start.offset
          ) {
            events[index][1].type = "strikethroughSequence" as TokenType;
            events[open][1].type = "strikethroughSequence" as TokenType;

            const strikethrough: Token = {
              type: "strikethrough" as TokenType,
              start: Object.assign({}, events[open][1].start),
              end: Object.assign({}, events[index][1].end),
            };

            const text: Token = {
              type: "strikethroughText" as TokenType,
              start: Object.assign({}, events[open][1].end),
              end: Object.assign({}, events[index][1].start),
            };

            // Opening.
            /** @type {Array<Event>} */
            const nextEvents: Event[] = [
              ["enter", strikethrough, context],
              ["enter", events[open][1], context],
              ["exit", events[open][1], context],
              ["enter", text, context],
            ];

            const insideSpan = context.parser.constructs.insideSpan.null;

            if (insideSpan) {
              // Between.
              splice(
                nextEvents,
                nextEvents.length,
                0,
                resolveAll(insideSpan, events.slice(open + 1, index), context),
              );
            }

            // Closing.
            splice(nextEvents, nextEvents.length, 0, [
              ["exit", text, context],
              ["enter", events[index][1], context],
              ["exit", events[index][1], context],
              ["exit", strikethrough, context],
            ]);

            splice(events, open - 1, index - open + 3, nextEvents);

            index = open + nextEvents.length - 2;
            break;
          }
        }
      }
    }

    index = -1;

    while (++index < events.length) {
      if (
        events[index][1].type ===
        ("strikethroughSequenceTemporary" as TokenType)
      ) {
        events[index][1].type = types.data;
      }
    }

    return events;
  }

  /**
   * @type {Tokenizer}
   */
  function tokenizeStrikethrough(
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State,
  ): State {
    const { now, sliceSerialize, previous: tentativePrevious } = this;
    const previous = isCodeLowSurrogate(tentativePrevious)
      ? // second (lower) surrogate likely to be preceded by first (higher) surrogate
        tryGetGenuinePreviousCode(tentativePrevious, now(), sliceSerialize)
      : tentativePrevious;

    const before = classifyCharacter(previous);
    let beforePrimary = before;

    if (isSvsFollowingCjk(before)) {
      const twoPrevious = tryGetCodeTwoBefore(
        // biome-ignore lint/style/noNonNullAssertion: if `previous` were null, before would be `undefined`
        previous!,
        now(),
        sliceSerialize,
      );
      if (twoPrevious !== null) beforePrimary = classifyCharacter(twoPrevious);
    }
    const events = this.events;
    let size = 0;

    return start;

    function start(code: Code): State | undefined {
      assert(code === codes.tilde, "expected `~`");

      if (
        previous === codes.tilde &&
        events[events.length - 1][1].type !== types.characterEscape
      ) {
        return nok(code);
      }

      effects.enter("strikethroughSequenceTemporary" as TokenType);
      return more(code);
    }

    /** @type {State} */
    function more(code: Code): State | undefined {
      const before = classifyCharacter(previous);

      if (code === codes.tilde) {
        // If this is the third marker, exit.
        if (size > 1) return nok(code);
        effects.consume(code);
        size++;
        return more;
      }

      if (size < 2 && !single) return nok(code);
      const token = effects.exit("strikethroughSequenceTemporary" as TokenType);
      const next = isCodeHighSurrogate(code)
        ? tryGetGenuineNextCode(code, now(), sliceSerialize)
        : code;

      const after = classifyCharacter(next);

      const beforeNonCjkPunctuation = isNonCjkPunctuation(before);
      const beforeSpaceOrNonCjkPunctuation =
        beforeNonCjkPunctuation || isUnicodeWhitespace(before);
      const afterNonCjkPunctuation = isNonCjkPunctuation(after);
      const afterSpaceOrNonCjkPunctuation =
        afterNonCjkPunctuation || isUnicodeWhitespace(after);
      const beforeCjkOrIvs = isCjk(beforePrimary) || isIvs(before);

      token._open =
        !afterSpaceOrNonCjkPunctuation ||
        (after === constants.attentionSideAfter &&
          (beforeSpaceOrNonCjkPunctuation || beforeCjkOrIvs));
      token._close =
        !beforeSpaceOrNonCjkPunctuation ||
        (before === constants.attentionSideAfter &&
          (afterSpaceOrNonCjkPunctuation || isCjk(after)));
      return ok(code);
    }
  }
}

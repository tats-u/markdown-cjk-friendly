import type { Code, Point, TokenizeContext } from "micromark-util-types";

/**
 * Check if the given code is a [High-Surrogate Code Unit](https://www.unicode.org/glossary/#high_surrogate_code_unit).
 *
 * A High-Surrogate Code Unit is the _first_ half of a [Surrogate Pair](https://www.unicode.org/glossary/#surrogate_pair).
 *
 * @param code Code.
 * @returns `true` if the code is a High-Surrogate Code Unit, `false` otherwise.
 */
export function isCodeHighSurrogate(code: Code): code is Exclude<Code, null> {
  return Boolean(code && code >= 0xd800 && code <= 0xdbff);
}

/**
 * Check if the given code is a [Low-Surrogate Code Unit](https://www.unicode.org/glossary/#low_surrogate_code_unit).
 *
 * A Low-Surrogate Code Unit is the _second_ half of a [Surrogate Pair](https://www.unicode.org/glossary/#surrogate_pair).
 * @param code
 *   The character code to check.
 * @returns
 *   True if the code is a Low-Surrogate Code Unit, false otherwise.
 */
export function isCodeLowSurrogate(code: Code): code is Exclude<Code, null> {
  return Boolean(code && code >= 0xdc00 && code <= 0xdfff);
}

/**
 * If `code` is a [Low-Surrogate Code Unit](https://www.unicode.org/glossary/#low_surrogate_code_unit), try to get a genuine previous [Unicode Scalar Value](https://www.unicode.org/glossary/#unicode_scalar_value) corresponding to the Low-Surrogate Code Unit.
 * @param code a tentative previous [code unit](https://www.unicode.org/glossary/#code_unit) less than 65,536, including a Low-Surrogate one
 * @param nowPoint `this.now()` (`this` = `TokenizeContext`)
 * @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
 * @returns a value greater than 65,535 if the previous code point represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), or `code` otherwise
 */
export function tryGetGenuinePreviousCode(
  code: Exclude<Code, null>,
  nowPoint: Point,
  sliceSerialize: TokenizeContext["sliceSerialize"],
): Exclude<Code, null> {
  if (nowPoint._bufferIndex < 2) {
    return code;
  }

  const previousBuffer = sliceSerialize({
    // take 2 characters (code units)
    start: { ...nowPoint, _bufferIndex: nowPoint._bufferIndex - 2 },
    end: nowPoint,
  });
  const previousCandidate = previousBuffer.codePointAt(0);
  // possibly undefined or surrogate (=isolated surrogate code point), so we have to make sure not
  return previousCandidate && previousCandidate >= 65_536
    ? previousCandidate
    : code;
}

/**
 * Try to get the [Unicode Code Point](https://www.unicode.org/glossary/#code_point) two positions before the current position.
 *
 * @param previousCode a previous code point. Should be greater than 65,535 if it represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character).
 * @param nowPoint `this.now()` (`this` = `TokenizeContext`)
 * @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
 * @returns a value greater than 65,535 if the code point two positions before represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), a value less than 65,536 for a [BMP Character](https://www.unicode.org/glossary/#bmp_character), or `null` if not found
 */
export function tryGetCodeTwoBefore(
  previousCode: Exclude<Code, null>,
  nowPoint: Point,
  sliceSerialize: TokenizeContext["sliceSerialize"],
): Code {
  const previousWidth = previousCode >= 65536 ? 2 : 1;
  if (nowPoint._bufferIndex < 1 + previousWidth) {
    return null;
  }
  // There are some cases where we can take only 1 character (collided with boundary)
  // If we pass negative _bufferIndex, an empty string is returned
  const idealStart = nowPoint._bufferIndex - previousWidth - 2;
  const twoPreviousBuffer = sliceSerialize({
    // take 1--2 character
    start: {
      ...nowPoint,
      _bufferIndex: idealStart >= 0 ? idealStart : 0,
    },
    end: {
      ...nowPoint,
      _bufferIndex: nowPoint._bufferIndex - previousWidth,
    },
  });
  const twoPreviousLast = twoPreviousBuffer.charCodeAt(
    twoPreviousBuffer.length - 1,
  );
  // out of range in charCodeAt => NaN
  if (Number.isNaN(twoPreviousLast)) {
    return null;
  }
  if (
    twoPreviousBuffer.length < 2 ||
    twoPreviousLast < 0xdc_00 ||
    0xdf_ff < twoPreviousLast
  ) {
    return twoPreviousLast;
  }
  const twoPreviousCandidate = twoPreviousBuffer.codePointAt(0);
  if (twoPreviousCandidate && twoPreviousCandidate >= 65_536) {
    return twoPreviousCandidate;
  }
  return twoPreviousLast;
}

/**
 * If `code` is a [High-Surrogate Code Unit](https://www.unicode.org/glossary/#high_surrogate_code_unit), try to get a genuine next [Unicode Scalar Value](https://www.unicode.org/glossary/#unicode_scalar_value) corresponding to the High-Surrogate Code Unit.
 * @param code a tentative next [code unit](https://www.unicode.org/glossary/#code_unit) less than 65,536, including a High-Surrogate one
 * @param nowPoint `this.now()` (`this` = `TokenizeContext`)
 * @param sliceSerialize `this.sliceSerialize` (`this` = `TokenizeContext`)
 * @returns a value greater than 65,535 if the next code point represents a [Supplementary Character](https://www.unicode.org/glossary/#supplementary_character), or `code` otherwise
 */
export function tryGetGenuineNextCode(
  code: Exclude<Code, null>,
  nowPoint: Point,
  sliceSerialize: TokenizeContext["sliceSerialize"],
): Exclude<Code, null> {
  const nextCandidate = sliceSerialize({
    start: nowPoint,
    end: { ...nowPoint, _bufferIndex: nowPoint._bufferIndex + 2 },
  }).codePointAt(0);
  return nextCandidate && nextCandidate >= 65_536 ? nextCandidate : code;
}

/*!
 * Phrasing algorithm adapted from mdast-util-to-markdown (commit 388140e).
 * Copyright (c) Titus Wormer <tituswormer@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type {
  Attention,
  AttentionInfo,
  Handle,
  Info,
  State,
} from "mdast-util-to-markdown";
import { defaultHandlers } from "mdast-util-to-markdown";
import {
  asciiAlpha,
  asciiAlphanumeric,
  asciiPunctuation,
} from "micromark-util-character";
import { htmlBlockNames, htmlRawNames } from "micromark-util-html-tag-name";
import {
  attentionSides,
  encodeInfo,
  firstCharacter,
  lastCharacter,
} from "./encode-info.js";

type PhrasingParent = Parameters<State["containerPhrasing"]>[0];
type AttentionHandle = Handle & {
  peek?: Handle;
  attention?: (
    node: Parameters<Attention>[0],
    state: State,
  ) => AttentionInfo & {
    cjkFriendly?: boolean;
  };
};
type AttentionResult = { children: Item[]; sequences: string[]; cjk: boolean };
type Item = AttentionResult | string;
type Token = { attention: AttentionResult | undefined; value: string };
type Run = {
  tokens: Token[];
  markers: Token[];
  start: number;
  end: number;
  open: boolean;
  close: boolean;
  split: boolean;
};
type Mistake = { attention: AttentionResult[]; index: number };
type Chosen = Map<AttentionResult, string>;

/** Mark an attention handler for CJK-aware encoding and pairing. */
export function cjkFriendlyAttention(handle: Handle): AttentionHandle {
  const attention = (handle as AttentionHandle).attention;
  if (!attention) throw new Error("Expected a handler with the attention API");
  const result: AttentionHandle = (node, parent, state, info) => {
    install(state);
    return handle(node, parent, state, info);
  };
  result.peek = (handle as AttentionHandle).peek;
  result.attention = (node, state) => ({
    ...attention(node, state),
    cjkFriendly: true,
  });
  return result;
}

function install(state: State): void {
  state.containerPhrasing = (parent, info) =>
    containerPhrasing(parent, state, info);
}

function withCjkPhrasing(handle: Handle): Handle {
  return (node, parent, state, info) => {
    install(state);
    return handle(node, parent, state, info);
  };
}

/** Install the container before serializing a document or a phrasing block. */
export const cjkFriendlyPhrasingHandlers = {
  root: withCjkPhrasing(defaultHandlers.root),
  paragraph: withCjkPhrasing(defaultHandlers.paragraph),
  heading: withCjkPhrasing(defaultHandlers.heading),
};

function candidates(
  tokens: Token[],
  involved: Token[],
  runOf: Map<Token, Run>,
): AttentionResult[] {
  const related = new Set<AttentionResult | undefined>();
  for (const token of tokens) {
    const siblings = runOf.get(token);
    if (
      siblings &&
      token.attention &&
      involved.some((d) => d.attention === token.attention)
    ) {
      for (const sibling of siblings.tokens) related.add(sibling.attention);
    }
  }
  const ordered: AttentionResult[] = [];
  for (const token of tokens) {
    if (token.attention && related.delete(token.attention))
      ordered.push(token.attention);
  }
  return ordered.reverse();
}

function check(
  tokens: Token[],
  before: string,
  after: string,
): Mistake | undefined {
  const runs: Run[] = [];
  const wrong = new Map<Token, Token[]>();
  const runOf = new Map<Token, Run>();
  let index = 0;
  while (index < tokens.length) {
    if (!tokens[index].attention) {
      index++;
      continue;
    }
    const marker = tokens[index].value.charAt(0);
    let end = index + 1;
    while (
      end < tokens.length &&
      tokens[end].attention &&
      tokens[end].value.charAt(0) === marker
    )
      end++;
    const group = tokens.slice(index, end);
    const { open, close } = attentionSides(
      index ? tokens[index - 1].value : before,
      end < tokens.length ? tokens[end].value : after,
      marker,
      group.some((token) => token.attention?.cjk),
    );
    const run: Run = {
      tokens: group,
      markers: [],
      start: 0,
      end: 0,
      open,
      close,
      split: marker === "*" || marker === "_",
    };
    for (const token of group) {
      wrong.set(token, [...group]);
      runOf.set(token, run);
      for (let size = token.value.length; size > 0; size--)
        run.markers.push(token);
    }
    run.end = run.markers.length;
    runs.push(run);
    index = end;
  }
  pair(runs, wrong);
  for (let index = 0; index < tokens.length; index++) {
    const involved = wrong.get(tokens[index]);
    if (involved)
      return { attention: candidates(tokens, involved, runOf), index };
  }
}

function pair(runs: Run[], wrong: Map<Token, Token[]>): void {
  let index = 0;
  while (index < runs.length) {
    const closer = runs[index];
    const marker = closer.tokens[0].value.charAt(0);
    const closerSize = closer.end - closer.start;
    let open = closer.close && closerSize ? index : 0;
    while (open--) {
      const opener = runs[open];
      const openerSize = opener.end - opener.start;
      if (
        opener.tokens[0].value.charAt(0) === marker &&
        opener.open &&
        openerSize &&
        (closer.split
          ? !((opener.close || closer.open) && closerSize % 3) ||
            (openerSize + closerSize) % 3
          : openerSize === opener.markers.length && openerSize === closerSize)
      ) {
        const size = closer.split
          ? openerSize > 1 && closerSize > 1
            ? 2
            : 1
          : closerSize;
        const opening = opener.markers.slice(opener.end - size, opener.end);
        const closing = closer.markers.slice(closer.start, closer.start + size);
        const openToken = opening[0];
        const closeToken = closing[0];
        if (
          openToken === opening[size - 1] &&
          openToken.value.length === size &&
          closeToken === closing[size - 1] &&
          closeToken.value.length === size &&
          openToken.attention === closeToken.attention
        ) {
          wrong.delete(openToken);
          wrong.delete(closeToken);
        } else {
          const involved = [...new Set([...opening, ...closing])];
          for (const token of involved) wrong.get(token)?.push(...involved);
        }
        opener.end -= size;
        closer.start += size;
        break;
      }
    }
    if (open === -1 || closer.start === closer.end) index++;
  }
}

function encode(tokens: Token[], start: boolean): void {
  const token = tokens[start ? 0 : tokens.length - 1];
  if (!token || token.attention || !token.value) return;
  const character = start
    ? firstCharacter(token.value)
    : lastCharacter(token.value);
  const reference = `&#x${character.codePointAt(0)?.toString(16).toUpperCase()};`;
  token.value = start
    ? reference + token.value.slice(character.length)
    : token.value.slice(0, -character.length) + reference;
}

function attentionSequences(
  type: string,
  markers: string[],
  sizes: number[],
): string[] {
  if (!markers.length || !sizes.length)
    throw new Error(
      `Cannot serialize ${type} as attention without markers and sizes`,
    );
  for (const size of sizes) {
    if (!Number.isSafeInteger(size) || size < 1)
      throw new Error(`Invalid attention size for ${type}: ${size}`);
  }
  const sequences: string[] = [];
  for (const marker of markers) {
    if (marker.length !== 1 || !asciiPunctuation(marker.charCodeAt(0)))
      throw new Error(`Invalid attention marker for ${type}: ${marker}`);
    for (const size of sizes) sequences.push(marker.repeat(size));
  }
  return sequences;
}

function htmlKind(value: string): number | undefined {
  if (value.charCodeAt(0) !== 60) return;
  const next = value.charCodeAt(1);
  if (next === 33) {
    const code = value.charCodeAt(2);
    if (code === 45) return 2;
    if (code === 91) return 5;
    if (asciiAlpha(code)) return 4;
    return;
  }
  if (next === 63) return 3;
  const closing = next === 47;
  const start = closing ? 2 : 1;
  let end = start;
  let code = value.charCodeAt(end);
  if (!asciiAlpha(code)) return;
  while (code === 45 || asciiAlphanumeric(code)) code = value.charCodeAt(++end);
  const name = value.slice(start, end).toLowerCase();
  if (!closing && code !== 47 && htmlRawNames.includes(name)) return 1;
  return htmlBlockNames.includes(name) ? 6 : 7;
}

function phrasing(parent: PhrasingParent, state: State, info: Info): Item[] {
  const children = parent.children;
  const results: Item[] = [];
  let before = info.before;
  state.indexStack.push(-1);
  let tracker = state.createTracker(info);
  try {
    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      state.indexStack[state.indexStack.length - 1] = index;
      const next = children[index + 1];
      let after = info.after;
      if (next) {
        const handle = state.handlers[next.type] as AttentionHandle | undefined;
        const peek = handle?.peek ?? handle;
        after = peek
          ? firstCharacter(
              peek(next, parent, state, {
                before: "",
                after: "",
                ...tracker.current(),
              }),
            )
          : "";
      }
      const previous = results[results.length - 1];
      if (
        typeof previous === "string" &&
        (before === "\r" || before === "\n") &&
        child.type === "html" &&
        htmlKind(child.value) !== 7
      ) {
        results[results.length - 1] = previous.replace(/(\r?\n|\r)$/, " ");
        before = " ";
        tracker = state.createTracker(info);
        tracker.move(serialize(results, info.before, info.after));
      }
      const handle = state.handlers[child.type] as AttentionHandle | undefined;
      if (handle?.attention) {
        const { construct, markers, sizes, cjkFriendly } = handle.attention(
          child,
          state,
        );
        const sequences = attentionSequences(child.type, markers, sizes);
        const sequence = sequences[0];
        const exit = state.enter(construct);
        tracker.move(sequence);
        let inside: Item[];
        try {
          inside = phrasing(child as PhrasingParent, state, {
            ...tracker.current(),
            before: sequence,
            after: sequence,
          });
          tracker.move(serialize(inside, sequence, sequence));
          tracker.move(sequence);
        } finally {
          exit();
        }
        results.push({
          children: inside,
          sequences,
          cjk: Boolean(cjkFriendly),
        });
        before = lastCharacter(sequence);
      } else {
        const value = state.handle(child, parent, state, {
          ...tracker.current(),
          after,
          before,
        });
        if (!value) continue;
        tracker.move(value);
        results.push(value);
        // Retain the preceding code point for variation-selector classification.
        before = value;
      }
    }
    return results;
  } finally {
    state.indexStack.pop();
  }
}

function render(
  items: Item[],
  chosen: Chosen,
  before: string,
  after: string,
): Token[] {
  const tokens: Token[] = [];
  let encodeAfter: string | undefined;
  let previous = before;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (typeof item === "string") {
      const token: Token = { value: item, attention: undefined };
      if (encodeAfter && encodeAfter === firstCharacter(item))
        encode([token], true);
      encodeAfter = undefined;
      tokens.push(token);
      if (token.value) previous = token.value;
      continue;
    }
    const sequence = chosen.get(item) || item.sequences[0];
    const marker = sequence.charAt(0);
    const next = items[index + 1];
    const outsideAfter =
      next === undefined
        ? after
        : typeof next === "string"
          ? next
          : chosen.get(next) || next.sequences[0];
    const inside = render(item.children, chosen, sequence, sequence);
    const head = inside[0]?.value ?? "";
    const open = encodeInfo(previous, head, marker, true, item.cjk);
    if (open.inside) encode(inside, true);
    const tail = inside[inside.length - 1]?.value ?? "";
    const close = encodeInfo(tail, outsideAfter, marker, false, item.cjk);
    if (close.inside) encode(inside, false);
    if (
      open.outside &&
      lastCharacter(previous) !== "\n" &&
      lastCharacter(previous) !== "\r"
    )
      encode(tokens, false);
    if (close.outside) encodeAfter = firstCharacter(outsideAfter);
    tokens.push({ value: sequence, attention: item }, ...inside, {
      value: sequence,
      attention: item,
    });
    previous = sequence;
  }
  return tokens;
}

function serialize(items: Item[], before: string, after: string): string {
  let chosen: Chosen = new Map();
  const initial = render(items, chosen, before, after);
  let tokens = initial;
  let mistake = check(tokens, before, after);
  while (mistake) {
    let improvement:
      | { chosen: Chosen; tokens: Token[]; mistake: Mistake | undefined }
      | undefined;
    for (const attention of mistake.attention) {
      const current = chosen.get(attention) || attention.sequences[0];
      for (const sequence of attention.sequences) {
        if (sequence === current) continue;
        const trial = new Map(chosen);
        trial.set(attention, sequence);
        const rendered = render(items, trial, before, after);
        const next = check(rendered, before, after);
        if (!next || next.index > mistake.index) {
          improvement = { chosen: trial, tokens: rendered, mistake: next };
          break;
        }
      }
      if (improvement) break;
    }
    if (!improvement) {
      tokens = initial;
      break;
    }
    chosen = improvement.chosen;
    tokens = improvement.tokens;
    mistake = improvement.mistake;
  }
  return tokens.map((token) => token.value).join("");
}

function containerPhrasing(
  parent: PhrasingParent,
  state: State,
  info: Info,
): string {
  return serialize(phrasing(parent, state, info), info.before, info.after);
}

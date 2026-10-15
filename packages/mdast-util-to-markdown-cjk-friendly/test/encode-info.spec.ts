import {
  attentionSides,
  firstCharacter,
  lastCharacter,
} from "../src/encode-info.js";

describe("boundary characters", () => {
  it.each([
    ["", "", ""],
    ["a", "a", "a"],
    ["abc", "a", "c"],
    ["𠀀a𠀁", "𠀀", "𠀁"],
    ["𠀀", "𠀀", "𠀀"],
    ["\ud800a\udc00", "\ud800", "\udc00"],
    ["\udc00", "\udc00", "\udc00"],
    ["\ud800", "\ud800", "\ud800"],
  ])("reads the first and last code points of %j", (value, first, last) => {
    expect(firstCharacter(value)).toBe(first);
    expect(lastCharacter(value)).toBe(last);
  });

  it.each([
    "漢",
    "𠀀",
  ])("recognizes CJK before a general-use variation selector: %s", (character) => {
    expect(attentionSides(`${character}\ufe00`, "(", "*", true)).toEqual({
      open: true,
      close: true,
    });
  });

  it.each([
    "a",
    "𐐀",
    "\ud800",
    "\udc00",
  ])("recognizes non-CJK before a general-use variation selector: %j", (character) => {
    expect(attentionSides(`${character}\ufe00`, "(", "*", true)).toEqual({
      open: false,
      close: true,
    });
  });
});

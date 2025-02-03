# CommonMark CJK-friendly Amendments Specification

CommonMark issue: https://github.com/commonmark/commonmark-spec/issues/650

The following chapters are written as an amendment to [the original CommonMark specification](https://spec.commonmark.org/0.31.2/). Missing chapters, sections, and definitions are the same as in the original specification.

## 2. Preliminaries 

### 2.1 Characters and lines

A <a href="#cjk-code-point-without-variation-selector" id="cjk-code-point-without-variation-selector">CJK code point without variation selector</a> is an [Unicode code point](http://unicode.org/glossary/#code_point) that meets _at least one_ of the following criteria:

- Meets _both_ of the following criteria:
  - [UAX #11 East Asian Width](https://www.unicode.org/reports/tr11/) category is either `W`, `F`, or `H`
  - Not in [RGI emoji set](https://www.unicode.org/reports/tr51/#def_rgi_set) (i.e. is not [fully-qualified emoji](https://www.unicode.org/reports/tr51/#def_fully_qualified_emoji)) defined in [UTS #51 Unicode Emoji](https://www.unicode.org/reports/tr51/#def_qualified_emoji_character)
- [UAX #24 Unicode Script Property](https://www.unicode.org/reports/tr24/) is Hangul

An <a href="#ivs" id="ivs">IVS (Ideographic Variation Selector/Sequence)</a> is an [Unicode code point](http://unicode.org/glossary/#code_point) in the Variation Selectors Supplement Block (U+E0100–U+E01EF).

A <a href="#svs-that-can-follow-cjk" id="svs-that-can-follow-cjk">SVS (Standard Variation Selector/Sequence) that can follow CJK</a> is an [Unicode code point](http://unicode.org/glossary/#code_point) other than U+FE0F in the Variation Selectors Block (U+FE00–U+FE0F) that can follow [CJK code point without variation selector](#cjk-code-point-without-variation-selector) (U+FE00–U+FE02 or U+FE0E as of Unicode 16[^svs-range]).

A <a href="#cjk-punctuation-character" id="cjk-punctuation-character">CJK punctuation character</a> is a [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) that is also a [CJK code point without variation selector](#cjk-code-point-without-variation-selector).

A <a href="non-cjk-punctuation-character" id="non-cjk-punctuation-character">non-CJK punctuation character</a> is a [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) other than [CJK punctuation character](#cjk-punctuation-character).

[^svs-range]: The range except for U+FE0E is computed from https://www.unicode.org/Public/16.0.0/ucd/StandardizedVariants.txt (as of Unicode 16) by extracting those that can follow CJK characters. Also, https://unicode.org/Public/16.0.0/ucd/emoji/emoji-variation-sequences.txt shows that U+FE0E can follow some CJK characters.

> [!NOTE]
> To see the concrete ranges of each definition, see [ranges.md](ranges.md).

## 6. Inlines

### 6.2 Emphasis and strong emphasis

> [!NOTE]
> The ***bold italic*** means the modified part.

A [left-flanking delimiter run](#left-flanking-delimiter-run) is a [delimiter run](https://spec.commonmark.org/0.31.2/#delimiter-run) that is (1) not followed by [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace), and either (2a) not followed by a ***[non-CJK punctuation character](#non-cjk-punctuation-character)*** or (2b) followed by a ***[non-CJK punctuation character](#non-cjk-punctuation-character)*** and preceded by ***(2bα)*** [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace)***, (2bβ)*** a ***[non-CJK punctuation character](#non-cjk-punctuation-character), (2bγ) a [CJK code point without variation selector](#cjk-code-point-without-variation-selector), (2bδ) an [IVS](#ivs), or (2bε) a [SVS that can follow CJK](#svs-that-can-follow-cjk) preceded by a [CJK code point without variation selector](#cjk-code-point-without-variation-selector)***. For purposes of this definition, the beginning and the end of the line count as [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace).

A right-flanking delimiter run is a [delimiter run](https://spec.commonmark.org/0.31.2/#delimiter-run) that is (1) not preceded by [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace), and either (2a) not preceded by a ***[non-CJK punctuation character](#non-cjk-punctuation-character)***, or (2b) preceded by a ***[non-CJK punctuation character](#non-cjk-punctuation-character)*** and followed by ***(2bα)*** [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace)***, (2bβ)*** a ***[non-CJK punctuation character](#non-cjk-punctuation-character), or (2bγ) a [CJK code point without variation selector](#cjk-code-point-without-variation-selector)***. For purposes of this definition, the beginning and the end of the line count as [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace).

## Tips for Implementers

See [implementers-tips.md](implementers-tips.md).

## Unicode data list

| Data name | Latest | Unicode 16 |
| --- | --- | --- |
| East Asian Width | https://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt | https://www.unicode.org/Public/16.0.0/ucd/EastAsianWidth.txt |
| Script | https://www.unicode.org/Public/UCD/latest/ucd/Scripts.txt | https://www.unicode.org/Public/16.0.0/ucd/Scripts.txt |
| Block | https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt | https://www.unicode.org/Public/16.0.0/ucd/Blocks.txt |
| Characters followed by SVS | https://www.unicode.org/Public/UCD/latest/ucd/StandardizedVariants.txt | https://www.unicode.org/Public/16.0.0/ucd/StandardizedVariants.txt |
| Characters followed by U+FE0E/U+FE0F | https://unicode.org/Public/UCD/latest/ucd/emoji/emoji-variation-sequences.txt | https://unicode.org/Public/16.0.0/ucd/emoji/emoji-variation-sequences.txt |
| Fully-qualified Emojis (without ZWJ) | https://unicode.org/Public/emoji/latest/emoji-sequences.txt | https://unicode.org/Public/16.0.0/emoji/emoji-sequences.txt |
| Emoji qualification test | https://unicode.org/Public/emoji/latest/emoji-test.txt | https://unicode.org/Public/16.0.0/emoji/emoji-test.txt |
| Characters that can be emoji (Useless) | https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt | https://www.unicode.org/Public/16.0.0/ucd/emoji/emoji-data.txt |

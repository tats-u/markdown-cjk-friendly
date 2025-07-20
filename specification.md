# CommonMark CJK-friendly Amendments Specification

CommonMark issue: https://github.com/commonmark/commonmark-spec/issues/650

The following chapters are written as an amendment to [the original CommonMark specification](https://spec.commonmark.org/0.31.2/). Missing chapters, sections, and definitions are the same as in the original specification.

## 2. Preliminaries

### 2.1 Characters and lines

A <a href="#cjk-character" id="cjk-character">CJK character</a> is a [character](https://spec.commonmark.org/0.31.2/#character) ([Unicode code point](http://unicode.org/glossary/#code_point)) that meets _at least one_ of the following criteria:

- Meets _both_ of the following criteria:
  - [UAX #11 East Asian Width](https://www.unicode.org/reports/tr11/) category is either `W`, `F`, or `H`
  - Not in [RGI emoji set](https://www.unicode.org/reports/tr51/#def_rgi_set) (i.e. is not [fully-qualified emoji](https://www.unicode.org/reports/tr51/#def_fully_qualified_emoji)) defined in [UTS #51 Unicode Emoji](https://www.unicode.org/reports/tr51/#def_qualified_emoji_character)
- [UAX #24 Unicode Script Property](https://www.unicode.org/reports/tr24/) is Hangul

An <a href="#ideographic-variation-selector" id="ideographic-variation-selector">Ideographic Variation Selector</a> is a [character](https://spec.commonmark.org/0.31.2/#character) in the Variation Selectors Supplement Block (U+E0100–U+E01EF).

A <a href="#non-emoji-general-use-variation-selector" id="non-emoji-svs">Non-emoji General-use Variation Selector</a> is a [character](https://spec.commonmark.org/0.31.2/#character) in the Variation Selectors Block (U+FE00–U+FE0F) other than [Emoji Presentation Selector](https://www.unicode.org/reports/tr51/#def_emoji_presentation_selector) U+FE0F.

A <a href="#cjk-sequence">CJK sequence</a> is a [CJK character](#cjk-character) or a sequence of 2 [characters](https://spec.commonmark.org/0.31.2/#character) where the first one is [CJK character](#cjk-character) and the second one is [Non-emoji General-use Variation Selector](#non-emoji-general-use-variation-selector).

A <a href="#cjk-punctuation-character" id="cjk-punctuation-character">CJK punctuation character</a> is a [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) that is also a [CJK character](#cjk-character).

A <a href="#non-cjk-punctuation-character" id="non-cjk-punctuation-character">non-CJK punctuation character</a> is a [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) other than [CJK punctuation character](#cjk-punctuation-character).

An <a href="#unicode-punctuation-sequence" id="unicode-punctuation-sequence">Unicode punctuation sequence</a> is an [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) or a sequence of 2 [characters](https://spec.commonmark.org/0.31.2/#character) where the first one is [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) and the second one is [Non-emoji General-use Variation Selector](#non-emoji-general-use-variation-selector).

A <a href="#cjk-ambiguous-punctuation-sequence" id="cjk-ambiguous-punctuation-sequence">CJK ambiguous punctuation sequence</a> is a [Standardized Variation Sequence](https://www.unicode.org/glossary/#standardized_variation_sequence) whose description in `StandardizedVariants.txt` [(the latest version)](https://www.unicode.org/Public/UCD/latest/ucd/StandardizedVariants.txt) contains a word "fullwidth form", whose first character is an [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character), and the [UAX #11 East Asian Width](https://www.unicode.org/reports/tr11/) category of whose first character is `A`.

A <a href="#cjk-punctuation-sequence" id="cjk-punctuation-sequence">CJK punctuation sequence</a> is a [CJK punctuation character](#cjk-punctuation-character), a [CJK ambiguous punctuation sequence](#cjk-ambiguous-punctuation-sequence), or a sequence of 2 [characters](https://spec.commonmark.org/0.31.2/#character) where the first one is [CJK punctuation character](#cjk-punctuation-character) and the second one is [Non-emoji General-use Variation Selector](#non-emoji-general-use-variation-selector).

A <a href="#non-cjk-punctuation-sequence" id="non-cjk-punctuation-sequence">Non-CJK punctuation sequence</a> is a [Non-CJK punctuation character](#non-cjk-punctuation-character) or a sequence of 2 [characters](https://spec.commonmark.org/0.31.2/#character) where the first one is [Non-CJK punctuation character](#non-cjk-punctuation-character) and the second one is [Non-emoji General-use Variation Selector](#non-emoji-general-use-variation-selector).

[^svs-range]: The range except for U+FE0E is computed from https://www.unicode.org/Public/16.0.0/ucd/StandardizedVariants.txt (as of Unicode 16) by extracting those that can follow CJK characters. Also, https://unicode.org/Public/16.0.0/ucd/emoji/emoji-variation-sequences.txt shows that U+FE0E can follow some CJK characters.

> [!NOTE]
> To see the concrete ranges of each definition, see [ranges.md](ranges.md).

## 6. Inlines

### 6.2 Emphasis and strong emphasis

> [!NOTE]
> The ***bold italic*** means the modified part.

A <a href="#left-flanking-delimiter-run" id="left-flanking-delimiter-run">left-flanking delimiter run</a> is a [delimiter run](https://spec.commonmark.org/0.31.2/#delimiter-run) that is (1) not followed by [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace), and either (2a) not followed by a ***[non-CJK punctuation character](#non-cjk-punctuation-character)*** or (2b) followed by a ***[non-CJK punctuation character](#non-cjk-punctuation-character)*** and preceded by ***(2bα)*** [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace)***, (2bβ)*** a ***[non-CJK punctuation sequence](#non-cjk-punctuation-sequence), (2bγ) a [CJK sequence](#cjk-sequence), or (2bδ) an [Ideographic Variation Selector](#ideographic-variation-selector)***. For purposes of this definition, the beginning and the end of the line count as [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace).

A <a href="#right-flanking-delimiter-run" id="right-flanking-delimiter-run">right-flanking delimiter run</a> is a [delimiter run](https://spec.commonmark.org/0.31.2/#delimiter-run) that is (1) not preceded by [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace), and either (2a) not preceded by a ***[non-CJK punctuation sequence](#non-cjk-punctuation-sequence)***, or (2b) preceded by a ***[non-CJK punctuation sequence](#non-cjk-punctuation-sequence)*** and followed by ***(2bα)*** [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace)***, (2bβ)*** a ***[non-CJK punctuation character](#non-cjk-punctuation-character), or (2bγ) a [CJK character](#cjk-character)***. For purposes of this definition, the beginning and the end of the line count as [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace).

> [!NOTE]
> If the [delimiter run](https://spec.commonmark.org/0.31.2/#delimiter-run) (1) adjoins a [Code Unit](https://www.unicode.org/glossary/#code_unit) that is not a part of an [Encoded Character](https://www.unicode.org/glossary/#encoded_character)/[Assigned Character](https://www.unicode.org/glossary/#assigned_character) (including [Ill-Formed Code Unit Subsequence](https://www.unicode.org/glossary/#ill_formed_code_unit_subsequence)s, e.g. isolated [Surrogate Code Points](https://www.unicode.org/glossary/#surrogate_code_point)/Units) or (2) is preceded by a [Standard Variation Selector](#standard-variation-selector) that is preceded by (2a) an [Unicode whitespace](https://spec.commonmark.org/0.31.2/#unicode-whitespace) or (2b) an [Ideographic Variation Selector](#ideographic-variation-selector), both of whether the [delimiter run](https://spec.commonmark.org/0.31.2/#delimiter-run) is left-flanking and whether it is right-flanking are [Unspecified](http://eel.is/c++draft/defns.unspecified).

<!--  -->

2\. A single `_` character [can open emphasis](https://spec.commonmark.org/0.31.2/#can-open-emphasis) iff it is part of a [left-flanking delimiter run](#left-flanking-delimiter-run) and either (a) not part of a [right-flanking delimiter run](#right-flanking-delimiter-run) or (b) part of a [right-flanking delimiter run](#right-flanking-delimiter-run) preceded by a***n*** [Unicode punctuation ***sequence***](#unicode-punctuation-sequence).

6\. A double `__` can [open strong emphasis](https://spec.commonmark.org/0.31.2/#can-open-strong-emphasis) iff it is part of a [left-flanking delimiter run](#left-flanking-delimiter-run) and either (a) not part of a [right-flanking delimiter run](#right-flanking-delimiter-run) or (b) part of a [right-flanking delimiter run](#right-flanking-delimiter-run) preceded by a***n*** [Unicode punctuation ***sequence***](#unicode-punctuation-sequence).

## Tips for Implementers

See [implementers-tips.md](implementers-tips.md).

## Unicode data list

| Data name | Latest | Unicode 16 |
| --- | --- | --- |
| East Asian Width | https://www.unicode.org/Public/UCD/latest/ucd/EastAsianWidth.txt | https://www.unicode.org/Public/16.0.0/ucd/EastAsianWidth.txt |
| Script | https://www.unicode.org/Public/UCD/latest/ucd/Scripts.txt | https://www.unicode.org/Public/16.0.0/ucd/Scripts.txt |
| Block | https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt | https://www.unicode.org/Public/16.0.0/ucd/Blocks.txt |
| Characters followed by Standard Variation Selector | https://www.unicode.org/Public/UCD/latest/ucd/StandardizedVariants.txt | https://www.unicode.org/Public/16.0.0/ucd/StandardizedVariants.txt |
| Characters followed by U+FE0E/U+FE0F | https://unicode.org/Public/UCD/latest/ucd/emoji/emoji-variation-sequences.txt | https://unicode.org/Public/16.0.0/ucd/emoji/emoji-variation-sequences.txt |
| Fully-qualified Emojis (without ZWJ) | https://unicode.org/Public/emoji/latest/emoji-sequences.txt | https://unicode.org/Public/16.0.0/emoji/emoji-sequences.txt |
| Emoji qualification test | https://unicode.org/Public/emoji/latest/emoji-test.txt | https://unicode.org/Public/16.0.0/emoji/emoji-test.txt |
| Characters that can be emoji (Useless) | https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt | https://www.unicode.org/Public/16.0.0/ucd/emoji/emoji-data.txt |

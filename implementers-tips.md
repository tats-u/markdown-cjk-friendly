# Tips for Implementers

- [CJK character](./specification.md#cjk-character) contains the following characters:
  - 〰 (U+3030)
  - 〽 (U+303D)
  - 🈂 (U+1F202)
  - 🈷 (U+1F237)
  - ㊗ (U+3297)
  - ㊙ (U+3299)
- Do not treat every character in [emoji-data.txt](https://www.unicode.org/Public/UCD/latest/ucd/emoji/emoji-data.txt) in the below data list as emoji. It includes ASCII digits, ASCII asterisk, ASCII hash sign, copyright symbol, trademark symbol, and so on. They should not be treated as emoji unless followed by a U+FE0F. We have to extract only characters with the `Emoji_Presentation` label.
- You can use `/^\p{Emoji_Presentation}/u`, or `/^\p{Basic_Emoji}/v` or `/^\p{RGI_Emoji}/v` in JavaScript to check if a code point is an emoji (as a default emoji presentation character or in the RGI emoji set). __`RGI_Emoji` characters other than `Basic_Emoji`__ ([basic emoji set](https://www.unicode.org/reports/tr51/#def_basic_emoji_set)) __have multiple code points and are not CJK as of Unicode 16. Never use `/^\p{Emoji}/u`__ instead of them because it is useless due to the fact that `/^\p{Emoji}/u.test("1")` is `true` (who on earth would insist that `1` is an emoji?). The `v` flag is available since ES2024 and supported by Node >= 20, Chrome (Edge) >= 112, Firefox >= 116, and Safari >= 17.
  - `"ES2024"` as `"target"` and `"lib"` in `tsconfig.json` is supported by TypeScript >= 5.7, Vite >= 6, and Vitest >= 3. You should use `"ESNext"` instead of `"ES2024"` for older ecosystems.
- There are no emojis whose East Asian Width is `F` or `H` as of Unicode 16.
- The East Asian Width of Ideographic Variation Selector and Standard Variation Selector is `A`.
- The East Asian Width of characters whose Script is Hangul can be `N` (U+1160–U+11FF). However, there are no characters whose Script is Hangul and East Asian Width is `A` or `Na` as of Unicode 16.
- You can use `/^\p{sc=Hangul}/u` in JavaScript to check if the Script of a character is Hangul.
- The East Asian Width of unassigned characters (e.g. U+3097) is undefined. You should follow the [guideline by Unicode](https://www.unicode.org/reports/tr11/#Unassigned). Note that U+2FFFE–U+2FFFF and U+2FFFE–U+2FFFF are Noncharacter, not Reserved (Unassigned). The East Asian Width of Noncharacter does not seem to be mentioned in the specifications of the East Asian Width property. Therefore, you can treat them as `W` to join two product terms for U+20000–U+2FFFD and U+30000–U+3FFFD.
- The Unicode category of Ideographic Variation Selector and Standard Variation Selector is `Mn`, not `P` or `S`. It means there is no [Unicode punctuation character](https://spec.commonmark.org/0.31.2/#unicode-punctuation-character) or [non-CJK punctuation character](#non-cjk-punctuation-character) that is also Standard Variation Selector or Ideographic Variation Selector.
- You do not have to care about the existence of continuous Standard Variation Selector or Ideographic Variation Selector, or Ideographic Variation Selector preceded by `*`. It is up to you implementers to decide how to treat them.

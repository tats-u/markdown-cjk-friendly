# marked-cjk-friendly

## 0.1.4

### Patch Changes

- [#85](https://github.com/tats-u/markdown-cjk-friendly/pull/85) [`2bab47a`](https://github.com/tats-u/markdown-cjk-friendly/commit/2bab47afcc889556dff52342e51434819089666f) Thanks [@tats-u](https://github.com/tats-u)! - Fix incorrect emphasis and strikethrough pairing when whitespace precedes a delimiter followed by CJK text. Keep intraword underscores literal when adjacent CJK letters prevent them from closing emphasis.

- [#83](https://github.com/tats-u/markdown-cjk-friendly/pull/83) [`2620aa5`](https://github.com/tats-u/markdown-cjk-friendly/commit/2620aa5d3ce7eb652e09f67ab995247eede5f5bc) Thanks [@tats-u](https://github.com/tats-u)! - Support the latest Marked

  Preserve native Marked emphasis behavior for delimiters without adjacent CJK, including changes in Marked 18.1.2 and 18.2.0. Support the original Marked 17 strikethrough tokenizer.

- [#87](https://github.com/tats-u/markdown-cjk-friendly/pull/87) [`6bbba89`](https://github.com/tats-u/markdown-cjk-friendly/commit/6bbba8902082a5f0fee12b755b2e5fdf5b70ad21) Thanks [@tats-u](https://github.com/tats-u)! - Fix nested emphasis and strong emphasis next to quotes and brackets in CJK text.

## 0.1.3

### Patch Changes

- [#71](https://github.com/tats-u/markdown-cjk-friendly/pull/71) [`bb8acfe`](https://github.com/tats-u/markdown-cjk-friendly/commit/bb8acfe832e31860452d57d9b151b6ccef08ef7d) Thanks [@tats-u](https://github.com/tats-u)! - Optimize getting the code point count

## 0.1.2

### Patch Changes

- [`caa3723`](https://github.com/tats-u/markdown-cjk-friendly/commit/caa37236186e0d294cd6da255a1bdde81dbc0f50) Thanks [@tats-u](https://github.com/tats-u)! - Update the CJK character ranges to Unicode 18

## 0.1.1

### Patch Changes

- [`db16a56`](https://github.com/tats-u/markdown-cjk-friendly/commit/db16a56994616ef7862aeb7eda7efdc54e6482e9) Thanks [@tats-u](https://github.com/tats-u)! - Fix incompatibility with marked 17.0.5+

  Marked changed the internal emStrong opening-delimiter capture layout in 17.0.5 and also added a same-delimiter stop condition that affects CommonMark emphasis parsing. Our CJK-aware tokenizer override was still assuming the older 17.0.4 layout, which caused the plugin to override native emphasis behavior for non-CJK cases on newer marked versions.

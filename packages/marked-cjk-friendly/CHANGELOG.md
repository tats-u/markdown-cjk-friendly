# marked-cjk-friendly

## 0.1.2

### Patch Changes

- [`caa3723`](https://github.com/tats-u/markdown-cjk-friendly/commit/caa37236186e0d294cd6da255a1bdde81dbc0f50) Thanks [@tats-u](https://github.com/tats-u)! - Update the CJK character ranges to Unicode 18

## 0.1.1

### Patch Changes

- [`db16a56`](https://github.com/tats-u/markdown-cjk-friendly/commit/db16a56994616ef7862aeb7eda7efdc54e6482e9) Thanks [@tats-u](https://github.com/tats-u)! - Fix incompatibility with marked 17.0.5+

  Marked changed the internal emStrong opening-delimiter capture layout in 17.0.5 and also added a same-delimiter stop condition that affects CommonMark emphasis parsing. Our CJK-aware tokenizer override was still assuming the older 17.0.4 layout, which caused the plugin to override native emphasis behavior for non-CJK cases on newer marked versions.

---
"marked-cjk-friendly": patch
---

Fix incompatibility with marked 17.0.5+

Marked changed the internal emStrong opening-delimiter capture layout in 17.0.5 and also added a same-delimiter stop condition that affects CommonMark emphasis parsing. Our CJK-aware tokenizer override was still assuming the older 17.0.4 layout, which caused the plugin to override native emphasis behavior for non-CJK cases on newer marked versions.

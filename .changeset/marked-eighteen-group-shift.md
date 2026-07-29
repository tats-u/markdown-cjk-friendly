---
"marked-cjk-friendly": patch
---

Fix emphasis being lost or invented with marked 18

Marked 18 captures the non-punctuation character after `*` and allows a
delimiter run to match with nothing after it, which shifts the group
indices of `emStrongLDelim`. The extension read the groups by their
marked-17 positions, so with marked 18 it dropped intraword emphasis
(`a*b*c`, `5*6*78`) and could invent emphasis that CommonMark rejects
(`a * foo bar*`). The group layout is now read from the rule itself, so
both marked 17 and 18 work.

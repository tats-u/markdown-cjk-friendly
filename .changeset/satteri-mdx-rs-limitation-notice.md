---
"remark-cjk-friendly": patch
"remark-cjk-friendly-gfm-strikethrough": patch
---

Add limitation notice for Rust-based MDX compilers (Sätteri)

Clarify in README files that these remark plugins do not support Rust-based MDX compilers, including:
- `@next/mdx` with the `mdxRs` option
- Rspack v1 with Rust-based Markdown/MDX parsing

Users must fall back to the unified ecosystem (remark and micromark) to use these plugins.

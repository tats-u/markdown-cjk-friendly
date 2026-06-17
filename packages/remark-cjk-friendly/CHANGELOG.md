# remark-cjk-friendly

## 2.2.0

### Minor Changes

- [`05e7a04`](https://github.com/tats-u/markdown-cjk-friendly/commit/05e7a0456a4fda07f6daca6e07a52ff6424815ef) Thanks [@tats-u](https://github.com/tats-u)! - feat(remark-\*): add new entry points /parseOnly & /serializeOnly

  Added new entry points for both `remark-cjk-friendly` and `remark-cjk-friendly-gfm-strikethrough` packages, allowing users to import only the parsing or serialization functionality as needed. This change helps reduce bundle size for users who only require one of the functionalities.

  When you want to use only the parsing functionality, or if you have been using these packages since v2.0.1 or earlier, you can now import plugins from `remark-cjk-friendly/parseOnly` and/or `remark-cjk-friendly-gfm-strikethrough/parseOnly`:

  ```diff
  -import remarkCjkFriendly from "remark-cjk-friendly";
  -import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
  +import remarkCjkFriendly from "remark-cjk-friendly/parseOnly";
  +import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/parseOnly";

   const processor = unified()
     .use(remarkParse)
     .use(remarkGfm)
     .use(remarkCjkFriendly)
     .use(remarkCjkFriendlyGfmStrikethrough)
     .use(remarkRehype)
     .use(rehypeStringify);
  ```

  If you only need the serialization functionality, you can import from `remark-cjk-friendly/serializeOnly` and/or `remark-cjk-friendly-gfm-strikethrough/serializeOnly`:

  ```diff
  -import remarkCjkFriendly from "remark-cjk-friendly";
  -import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
  +import remarkCjkFriendly from "remark-cjk-friendly/serializeOnly";
  +import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/serializeOnly";

   const processor = unified()
     .use(rehypeParse)
     .use(remarkRehype, { allowDangerousHtml: true })
     .use(remarkCjkFriendly)
     .use(remarkCjkFriendlyGfmStrikethrough)
     .use(remarkStringify);
  ```

## 2.1.0

### Minor Changes

- [`f79f128`](https://github.com/tats-u/markdown-cjk-friendly/commit/f79f12843b70f2ef7b8d049c1350221061897e01) Thanks [@tats-u](https://github.com/tats-u)! - Support HTML-to-Markdown path

### Patch Changes

- [`7f81e71`](https://github.com/tats-u/markdown-cjk-friendly/commit/7f81e71e3c7d7e9f2d33823160d37a718a9fcaba) Thanks [@tats-u](https://github.com/tats-u)! - docs(remark-\*): clarify Rust-based Markdown/MDX compiler limitations in README

- Updated dependencies [[`f79f128`](https://github.com/tats-u/markdown-cjk-friendly/commit/f79f12843b70f2ef7b8d049c1350221061897e01)]:
  - mdast-util-to-markdown-cjk-friendly@1.0.0

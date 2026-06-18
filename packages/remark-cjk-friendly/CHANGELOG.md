# remark-cjk-friendly

## 2.3.0

### Minor Changes

- [`9371983`](https://github.com/tats-u/markdown-cjk-friendly/commit/937198303c88fb6965cc37209b9c4398ae3b1388) Thanks [@tats-u](https://github.com/tats-u)! - feat(remark-\*): add new entry point `/bidi`

  I may have made a design mistake in v2.1.0—most users only needs parsing, but I added serialization as an opt-out, increasing the bundle size by a few KB. For the next major version upgrade, I may introduce a breaking change to enable only parsing (currently `/parseOnly`) unless a subpath is specified, just like in v2.0.1 or earlier, in a future release. To prepare, I've added a new entry point `/bidi` for users using both parsing and serialization. I recommend updating your `import` statements now:

  ```diff
  -import remarkCjkFriendly from "remark-cjk-friendly";
  -import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
  +import remarkCjkFriendly from "remark-cjk-friendly/bidi";
  +import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough/bidi";
  ```

  If you're a user who has been using these plugins since v2.0.1 or earlier and don't particularly care about bundle size, feel free to import them either with or without the `/parseOnly` suffix.

### Patch Changes

- [`3d003d1`](https://github.com/tats-u/markdown-cjk-friendly/commit/3d003d1cafae4a6eaf5030158772ae544dc0cc1d) Thanks [@tats-u](https://github.com/tats-u)! - docs(remark-\*): update related packages in README

  Good news: this doesn't change any functionality.

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

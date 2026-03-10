# marked-cjk-friendly

A [Marked.js](https://github.com/markedjs/marked) extension to make Markdown emphasis (`**`) in CommonMark compatible with Chinese, Japanese, and Korean (CJK).

<span lang="ja">CommonMarkの強調記号(`**`)を日本語・中国語・韓国語にきちんと対応させるための[Marked.js](https://github.com/markedjs/marked)拡張</span>

<span lang="zh-Hans-CN">一个 [Marked.js](https://github.com/markedjs/marked) 扩展，用于使 CommonMark 的强调标记(`**`)能够正确支持中文、日语和韩语文本。</span>

<span lang="ko">CommonMark의 강조 표시(`**`) 를 한국어, 일본어, 중국어와 호환되도록 만드는 [Marked.js](https://github.com/markedjs/marked) 확장</span>

## Problem / <span lang="ja">問題</span> / <span lang="zh-Hans-CN">问题</span> / <span lang="ko">문제</span>

CommonMark has a problem that the following emphasis marks `**` are not recognized as emphasis marks in Japanese, Chinese, and Korean.

<span lang="ja">CommonMarkには、日本語・中国語・韓国語内の次のような強調記号(`**`)が強調記号として認識されない問題があります。</span>

<span lang="zh-Hans-CN">CommonMark存在以下问题：在中文、日语和韩语文本中，强调标记`**`不会被识别为强调标记。</span>

<span lang="ko">CommonMark는 한국어, 일본어, 중국어에서 다음과 같은 강조 표시 `**`가 강조 표시로 인식되지 않는 문제가 있습니다.</span>

```md
**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。

**该星号不会被识别，而是直接显示。**这是因为它没有被识别为强调符号。

**이 별표는 강조 표시로 인식되지 않고 그대로 표시됩니다(이 괄호 때문에)**이 문장 때문에.
```

CommonMark issue: https://github.com/commonmark/commonmark-spec/issues/650

## Runtime Requirements / <span lang="ja">実行環境の要件</span> / <span lang="zh-Hans-CN">运行环境要求</span> / <span lang="ko">런타임 요구 사항</span>

This package is ESM-only. It requires Node.js 18 or later.

<span lang="ja">本パッケージはESM専用です。Node.js 18以上が必要です。</span>

<span lang="zh-Hans-CN">此包仅支持ESM。需要Node.js 18或更高版本。</span>

<span lang="ko">본 패키지는 ESM 전용입니다. Node.js 18 이상이 필요합니다.</span>

## Installation / <span lang="ja">インストール</span> / <span lang="zh-Hans-CN">安装</span> / <span lang="ko">설치</span>

Install `marked-cjk-friendly` via [npm](https://www.npmjs.com/):

```bash
npm install marked-cjk-friendly
```

If you use another package manager, please replace `npm install` with the command of the package manager you use (e.g. `pnpm add` or `yarn add`).

## Usage / <span lang="ja">使い方</span> / <span lang="zh-Hans-CN">用法</span> / <span lang="ko">사용법</span>

Import `marked` and `marked-cjk-friendly`, and use the extension as follows:

```js
import { Marked } from "marked";
import markedCjkFriendly from "marked-cjk-friendly";

const marked = new Marked(markedCjkFriendly());
const html = marked.parse("**こんにちは。**ここ");
```

Or using the `use` method:

```js
import { marked } from "marked";
import markedCjkFriendly from "marked-cjk-friendly";

marked.use(markedCjkFriendly());
const html = marked("**こんにちは。**ここ");
```

## Compatibility with the other languages / <span lang="ja">他言語との互換性</span> / <span lang="zh-Hans-CN">与其他语言的兼容性</span> / <span lang="ko">다른 언어와의 호환성</span>

This modification of the specification does not affect the other languages than Chinese, Japanese, and Korean. Even if your application or document has translations or content in other languages, it will not be affected, so please feel free to use this package.

<span lang="ja">この仕様変更提案は、日本語・中国語・韓国語以外の言語には影響しません。アプリケーションやドキュメントに他言語の翻訳やコンテンツが含まれていても影響はありませんので、安心して本パッケージをご利用ください。</span>

<span lang="zh-Hans-CN">除中文、日文和韩文外，建议的规范变更不会影响其他语言。请放心使用此软件包。</span>

<span lang="ko">이 사양 변경 제안은 한국어, 일본어, 중국어 이외의 언어에는 영향을 미치지 않습니다. 애플리케이션이나 문서에 다른 언어의 번역이나 콘텐츠가 포함되어 있어도 영향을 받지 않으므로 안심하고 본 패키지를 사용하시기 바랍니다.</span>

## Specification / <span lang="ja">規格書</span> / <span lang="zh-Hans-CN">规范</span> / <span lang="ko">설명서</span>

https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md (English)

## Related packages / <span lang="ja">関連パッケージ</span> / <span lang="zh-Hans-CN">相关包</span> / <span lang="ko">관련 패키지</span>

- [markdown-it-cjk-friendly](https://npmjs.com/package/markdown-it-cjk-friendly) — markdown-it plugin
- [remark-cjk-friendly](https://npmjs.com/package/remark-cjk-friendly) — remark plugin
  - [micromark-extension-cjk-friendly](https://npmjs.com/package/micromark-extension-cjk-friendly) — micromark extension

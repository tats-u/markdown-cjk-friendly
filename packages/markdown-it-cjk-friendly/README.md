# markdown-it-cjk-friendly

[![Version](https://img.shields.io/npm/v/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dw/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly)

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin to make Markdown emphasis (`**`) in CommonMark compatible with Chinese, Japanese, and Korean (CJK).

<span lang="ja">CommonMarkの強調記号(`**`)を日本語・中国語・韓国語にきちんと対応させるための[markdown-it](https://github.com/markdown-it/markdown-it)プラグイン</span>

<span lang="zh-Hans-CN">一个 [markdown-it](https://github.com/markdown-it/markdown-it) 插件，用于使 CommonMark 的强调标记(`**`)能够正确支持中文、日语和韩语文本。</span>

<span lang="ko">CommonMark의 강조 표시(`**`) 를 한국어, 중국어, 일본어와 호환되도록 만드는 [markdown-it](https://github.com/markdown-it/markdown-it) 플러그인</span>

## Problem / <span lang="ja">問題</span> / <span lang="zh-Hans-CN">问题</span> / <span lang="ko">문제점</span>

CommonMark has a problem that the following emphasis marks `**` are not recognized as emphasis marks in Japanese, Chinese, and Korean.

<span lang="ja">CommonMarkには、日本語・中国語・韓国語内の次のような強調記号(`**`)が強調記号として認識されない問題があります。</span>

<span lang="zh-Hans-CN">CommonMark存在以下问题：在中文、日语和韩语文本中，强调标记`**`不会被识别为强调标记。</span>

<span lang="ko">CommonMark는 일본어와 중국어에서 다음과 같은 강조 표시 `**`가 강조 표시로 인식되지 않는 문제가 있습니다.</span>

```md
**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。

**该星号不会被识别，而是直接显示。**这是因为它没有被识别为强调符号。

**이 별표는 강조 표시로 인식되지 않고 그대로 표시됩니다(이 괄호 때문에)**이 문장 때문에.
```

This problem occurs because the character just inside the `**` is a (Japanese or Chinese) punctuation mark (。) or parenthesis and the character just outside is not a space or punctuation mark.

<span lang="ja">これが起こった原因は、終了側の`**`のすぐ内側が約物（。やカッコ）、かつ外側が約物や空白以外の文字であるためです。</span>

<span lang="zh-Hans-CN">这个问题是因为在`**`的结束部分，内侧字符是标点符号（。）或括号，而外侧字符不是空格或标点符号。</span>

<span lang="ko">이 문제는 `**` 바로 안쪽의 문자가 (일본어나 중국어) 문장 부호(。) 또는 괄호이고 바깥쪽 문자가 공백이나 문장 부호가 아니기 때문에 발생합니다.</span>

Of course, not only the end side but also the start side has the same issue.

<span lang="ja">もちろん終了側だけでなく、開始側も同様の問題が存在します。</span>

<span lang="zh-Hans-CN">当然，不仅是结束侧，开始侧也存在同样的问题。</span>

<span lang="ko">물론 끝나는 부분뿐만 아니라 시작하는 부분에서도 동일한 문제가 있습니다.</span>

CommonMark issue: https://github.com/commonmark/commonmark-spec/issues/650

## Runtime Requirements / <span lang="ja">実行環境の要件</span> / <span lang="zh-Hans-CN">运行环境要求</span> / <span lang="ko">업데이트 전략</span>

This package uses the [`v` flag of the regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets) introduced in ES2024 to determine whether the character is an emoji or not.

<span lang="ja">本パッケージは文字が絵文字かどうかを判定するために、ES2024で導入された[正規表現の`v`フラグ](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets)を使用しています。</span>

<span lang="zh-CN">本包使用 ES2024 引入的[`v` 标志](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets) 来判断字符是否为 emoji。</span>

<span lang="ko">이 패키지는 ES2024에서 도입된 [`v` 플래그](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets)를 사용하여 문자가 이모지인지 여부를 판단합니다.</span>

It makes this package compatible only with relatively recent browsers and Node.js:

<span lang="ja">このため、本パッケージは、次のような比較的新しいブラウザやNode.jsでしか動作しません。</span>

<span lang="zh-CN">因此，本包只兼容比较新的浏览器和 Node.js:</span>

<span lang="ko">따라서, 이 패키지는 비교적 최신 브라우저와 Node.js에서만 작동합니다.</span>

- Chrome / Edge 112 or later
- Firefox 116 or later
- Safari 17 or later
- Node.js 20 or later

## Installation / <span lang="ja">インストール</span> / <span lang="zh-Hans-CN">安装</span> / <span lang="ko">설치</span>

Install `markdown-it-cjk-friendly` via [npm](https://www.npmjs.com/):

<span lang="ja">`markdown-it-cjk-friendly`を[npm](https://www.npmjs.com/)でインストールしてください。</span>

<span lang="zh-Hans-CN">通过 [npm](https://www.npmjs.com/) 安装 `markdown-it-cjk-friendly`。</span>

<span lang="ko">`markdown-it-cjk-friendly`를 [npm](https://www.npmjs.com/)으로 설치하세요.</span>

```bash
npm install markdown-it-cjk-friendly
```

If you use another package manager, please replace `npm install` with the command of the package manager you use (e.g. `pnpm add` or `yarn add`).

<span lang="ja">npm以外のパッケージマネージャを使う場合は、`npm install`を当該パッケージマネージャのコマンド（例：`pnpm add`・`yarn add`）に置き換えてください。</span>

<span lang="zh-Hans-CN">如果使用其他包管理器，请将 `npm install` 替换为当时包管理器的命令（例如：`pnpm add`、`yarn add`）。</span>

<span lang="ko">다른 패키지 매니저를 사용하는 경우 `npm install`을 해당 패키지 매니저의 명령어(예: `pnpm add`, `yarn add`)로 바꾸어 주세요.</span>

## Usage / <span lang="ja">使い方</span> / <span lang="zh-Hans-CN">用法</span> / <span lang="ko">사용법</span>

Import `markdown-it` and `markdown-it-cjk-friendly`, and use the plugin as follows:

<span lang="ja">`markdown-it`と`markdown-it-cjk-friendly`をインポートし、次のようにプラグインを使用してください。</span>

<span lang="zh-Hans-CN">通过 `markdown-it` 和 `markdown-it-cjk-friendly` 导入，然后使用插件如下：</span>

<span lang="ko">`markdown-it`와 `markdown-it-cjk-friendly`를 임포트하고 다음과 같이 플러그인을 사용하세요.</span>

```js
import MarkdownIt from "markdown-it";
import markdownItCjkFriendly from "markdown-it-cjk-friendly";

const md = MarkdownIt();
md.use(markdownItCjkFriendly);
```

## Compatibility with the other languages / <span lang="ja">他言語との互換性</span> / <span lang="zh-Hans-CN">与其他语言的兼容性</span> / <span lang="ko">다른 언어와의 호환성</span>

This modification of the specification does not affect the other languages than Chinese, Japanese, and Korean. Even if your application or document has translations or content in other languages, it will not be affected, so please feel free to use this packages.

<span lang="ja">この仕様変更提案は、日本語・中国語・韓国語以外の言語には影響しません。アプリケーションやドキュメントに他言語の翻訳やコンテンツが含まれていても影響はありませんので、安心して本パッケージをご利用ください。</span>

<span lang="zh-Hans-CN">除中文、日文和韩文外，建议的规范变更不会影响其他语言。请放心使用此软件包，因为如果您的应用程序或文档包含其他语言的翻译或内容，也不会受到影响。</span>

<span lang="ko">이번 사양 변경 제안은 일본어, 중국어, 한국어 이외의 언어에는 영향을 미치지 않습니다. 애플리케이션이나 문서에 다른 언어의 번역이나 콘텐츠가 포함되어 있어도 영향을 받지 않으므로 안심하고 본 패키지를 사용하시기 바랍니다.</span>

## Specification / <span lang="ja">規格書</span> / <span lang="zh-Hans-CN">规范</span> / <span lang="ko">규정서</span>

https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md (English)

## Related packages / <span lang="ja">関連パッケージ</span> / <span lang="zh-Hans-CN">相关包</span> / <span lang="ko">관련 패키지</span>

- [remark-cjk-friendly](https://npmjs.com/package/remark-cjk-friendly) [![Version](https://img.shields.io/npm/v/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dw/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly)
- [micromark-extension-cjk-friendly](https://npmjs.com/package/micromark-extension-cjk-friendly) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dw/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly)


## Contributing / <span lang="ja">貢献</span> / <span lang="zh-Hans-CN">贡献</span> / <span lang="ko">기여</span>

### Setup

Install the dependencies:

```bash
pnpm install
```

### Get Started

Build the library:

```bash
pnpm build
```

Build the library in watch mode:

```bash
pnpm dev
```

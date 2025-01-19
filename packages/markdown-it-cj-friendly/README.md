# markdown-it-cj-friendly

[![Version](https://img.shields.io/npm/v/markdown-it-cj-friendly)![NPM Downloads](https://img.shields.io/npm/dw/markdown-it-cj-friendly)![NPM Last Update](https://img.shields.io/npm/last-update/markdown-it-cj-friendly)](https://npmjs.com/package/markdown-it-cj-friendly)

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin to make Markdown emphasis (`**`) in CommonMark compatible with Chinese and Japanese.

<span lang="ja">CommonMarkの強調記号(`**`)を中国語・日本語にきちんと対応させるための[markdown-it](https://github.com/markdown-it/markdown-it)プラグイン</span>

<span lang="zh-Hans-CN">一个 [markdown-it](https://github.com/markdown-it/markdown-it) 插件，用于使 CommonMark 的强调标记(`**`)能够正确支持中文和日语文本。</span>

## Problem / <span lang="ja">問題</span> / <span lang="zh-Hans-CN">问题</span>

CommonMark has a problem that the following emphasis marks `**` are not recognized as emphasis marks in Japanese and Chinese.

<span lang="ja">CommonMarkには、日本語・中国語内の次のような強調記号(`**`)が強調記号として認識されない問題があります。</span>

<span lang="zh-Hans-CN">CommonMark存在以下问题：在中文和日语文本中，强调标记**不会被识别为强调标记。</span>

```md
**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。

**该星号不会被识别，而是直接显示。**这是因为它没有被识别为强调符号。
```

This problem occurs because the character just inside the `**` is a (Japanese or Chinese) punctuation mark (。) and the character just outside is not a space or punctuation mark.

<span lang="ja">これが起こった原因は、終了側の`**`のすぐ内側が約物（。）、かつ外側が約物や空白以外の文字であるためです。</span>

<span lang="zh-Hans-CN">这个问题是因为在`**`的结束部分，内侧字符是中文或日文的标点符号（。），而外侧字符不是空格或标点符号。</span>

Of course, not only the end side but also the start side has the same issue.

<span lang="ja">もちろん終了側だけでなく、開始側も同様の問題が存在します。</span>

<span lang="zh-Hans-CN">当然，不仅是结束侧，开始侧也存在同样的问题。</span>

## Installation / <span lang="ja">インストール</span> / <span lang="zh-Hans-CN">安装</span>

Install `markdown-it-cj-friendly` via [npm](https://www.npmjs.com/):

<span lang="ja">`markdown-it-cj-friendly`を[npm](https://www.npmjs.com/)でインストールしてください。</span>

<span lang="zh-Hans-CN">通过 [npm](https://www.npmjs.com/) 安装 `markdown-it-cj-friendly`。</span>

```bash
npm install markdown-it-cj-friendly
```

If you use another package manager, please replace `npm` with the command of the package manager you use (e.g. `pnpm`).

<span lang="ja">npm以外のパッケージマネージャを使う場合は、`npm`を当該パッケージマネージャのコマンド（例：`pnpm`）に置き換えてください。</span>

<span lang="zh-Hans-CN">如果使用其他包管理器，请将 `npm` 替换为当时包管理器的命令（例如：`pnpm`）。</span>

## Usage / <span lang="ja">使い方</span> / <span lang="zh-Hans-CN">用法</span>

Import `markdown-it` and `markdown-it-cj-friendly`, and use the plugin as follows:

<span lang="ja">`markdown-it`と`markdown-it-cj-friendly`をインポートし、次のようにプラグインを使用してください。</span>

<span lang="zh-Hans-CN">通过 `markdown-it` 和 `markdown-it-cj-friendly` 导入，然后使用插件如下：</span>

```js
import MarkdownIt from "markdown-it";
import markdownItCjFriendly from "markdown-it-cj-friendly";

const md = MarkdownIt();
md.use(markdownItCjFriendly);
```

## Contributing / <span lang="ja">貢献</span> / <span lang="zh-Hans-CN">贡献</span>

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

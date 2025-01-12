# markdown-it-cj-friendly

[![Version](https://img.shields.io/npm/v/markdown-it-cj-friendly)](https://npmjs.com/package/markdown-it-cj-friendly)

A [markdown-it](https://github.com/markdown-it/markdown-it) plugin to make Markdown emphasis (`**`) in CommonMark compatible with Chinese and Japanese.

CommonMarkの強調記号(`**`)を中国語・日本語にきちんと対応させるための[markdown-it](https://github.com/markdown-it/markdown-it)プラグイン

一个 [markdown-it](https://github.com/markdown-it/markdown-it) 插件，用于使 CommonMark 的强调标记(`**`)能够正确支持中文和日语文本。

## Problem / 問題 / 问题

CommonMark has a problem that the following emphasis marks `**` are not recognized as emphasis marks in Japanese and Chinese.

CommonMarkには、日本語・中国語内の次のような強調記号(`**`)が強調記号として認識されない問題があります。

CommonMark存在以下问题：在中文和日语文本中，强调标记**不会被识别为强调标记。

```md
**このアスタリスクは強調記号として認識されず、そのまま表示されます。**この文のせいで。

**该星号不会被识别，而是直接显示。**这是因为它没有被识别为强调符号。
```

This problem occurs because the character just inside the `**` is a (Japanese or Chinese) punctuation mark (。) and the character just outside is not a space or punctuation mark.

これが起こった原因は、終了側の`**`のすぐ内側が約物（。）、かつ外側が約物や空白以外の文字であるためです。

这个问题是因为在`**`的结束部分，内侧字符是中文或日文的标点符号（。），而外侧字符不是空格或标点符号。

Of course, not only the end side but also the start side has the same issue.

もちろん終了側だけでなく、開始側も同様の問題が存在します。

当然，不仅是结束侧，开始侧也存在同样的问题。

## Installation / インストール / 安装

Install `markdown-it-cj-friendly` via [npm](https://www.npmjs.com/):

`markdown-it-cj-friendly`を[npm](https://www.npmjs.com/)でインストールしてください。

通过 [npm](https://www.npmjs.com/) 安装 `markdown-it-cj-friendly`。

```bash
npm install markdown-it-cj-friendly
```

## Usage / 使い方 / 用法

Import `markdown-it` and `markdown-it-cj-friendly`, and use the plugin as follows:

`markdown-it`と`markdown-it-cj-friendly`をインポートし、次のようにプラグインを使用してください。

通过 `markdown-it` 和 `markdown-it-cj-friendly` 导入，然后使用插件如下：

```js
import MarkdownIt from "markdown-it";
import markdownItCjFriendly from "markdown-it-cj-friendly";

const md = MarkdownIt();
md.use(markdownItCjFriendly);
```

## Contributing / 貢獻 / 贡献

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

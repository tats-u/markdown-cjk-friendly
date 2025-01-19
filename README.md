# Markdown packages in CommonMark revision candidate compatible with Chinese, Japanese, and Korean (CJK)

## Packages / <span lang="ja">パッケージ一覧</span> / <span lang="zh-Hans-CN">包裹</span> / <span lang="ko">패키지 목록</span>

- [`markdown-it-cjk-friendly`](./packages/markdown-it-cjk-friendly) [![Version](https://img.shields.io/npm/v/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly) ![NPM Downloads](https://img.shields.io/npm/dw/markdown-it-cjk-friendly)![NPM Last Update](https://img.shields.io/npm/last-update/markdown-it-cjk-friendly)
- ~~[`markdown-it-cj-friendly`](./packages/markdown-it-cj-friendly)~~ [![Version](https://img.shields.io/npm/v/markdown-it-cj-friendly)](https://npmjs.com/package/markdown-it-cj-friendly)![NPM Downloads](https://img.shields.io/npm/dw/markdown-it-cj-friendly) (Deprecated; switch to `markdown-it-cjk-friendly`)

## Planned / <span lang="ja">予定</span> / <span lang="zh-Hans-CN">计划</span> / <span lang="ko">예정</span>

- Drop-in replacement packages for micromark

## Specification / <span lang="ja">規格書</span> / <span lang="zh-Hans-CN">规范</span> / <span lang="ko">규정서</span>

See [specification.md](specification.md).

<span lang="ja">[specification.md](specification.md)（英語） を参照してください。</span>

<span lang="zh-Hans-CN">参考 [specification.md](specification.md)（英文）。</span>

<span lang="ko">[specification.md](specification.md)（영어）를 참고해 주시기 바라요.</span>

## Problem / <span lang="ja">問題</span> / <span lang="zh-Hans-CN">问题</span> / <span lang="ko">문제점</span>

CommonMark has a problem that the following emphasis marks `**` are not recognized as emphasis marks in Japanese,Chinese, and Korean.

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

## Contributing / <span lang="ja">貢獻</span> / <span lang="zh-Hans-CN">贡献</span> / <span lang="ko">기여</span>

### Submit an issue or PR / <span lang="ja">Issue・PRの投稿</span> / <span lang="zh-Hans-CN">提出一个 issue 或 PR</span> / <span lang="ko">이슈 및 PR 제출</span>

Please submit an issue or PR in English or Japanese. English is recommended.

<span lang="ja">Issue・PRは英語か日本語で投稿してください。英語を推奨します。</span>

<span lang="zh-Hans-CN">请用英语或日语提交问题或 PR。建议使用英语。</span>

<span lang="ko">이슈나 PR은 영어 또는 일본어로 제출해 주시기 바랍니다. 영어를 권장합니다.</span>

### Build

This repository adopts [PNPM](https://pnpm.io/) as a package manager.

To build all packages, run:

```bash
pnpm i
node --run build
```

To run tests, run:

```bash
node --run test
```

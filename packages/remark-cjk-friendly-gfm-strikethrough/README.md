# remark-cjk-friendly-gfm-strikethrough

[![Version](https://img.shields.io/npm/v/remark-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) ![Node Current](https://img.shields.io/node/v/remark-cjk-friendly-gfm-strikethrough) [![NPM Downloads](https://img.shields.io/npm/dm/remark-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) [![NPM Last Update](https://img.shields.io/npm/last-update/remark-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) [![Socket Badge](https://badge.socket.dev/npm/package/remark-cjk-friendly-gfm-strikethrough)](https://socket.dev/npm/package/remark-cjk-friendly-gfm-strikethrough) [\[Snyk Security\]](https://security.snyk.io/package/npm/remark-cjk-friendly-gfm-strikethrough)

A [remark](https://github.com/remarkjs/remark) plugin to make GitHub Flavored Markdown (GFM) strikethrough (`~~`) compatible with Chinese, Japanese, and Korean (CJK).

<span lang="ja">GitHub Flavored Markdown（GFM）の取り消し線記号（`~~`）を日本語・中国語・韓国語にきちんと対応させるための[remark](https://github.com/remarkjs/remark)プラグイン</span>

<span lang="zh-Hans-CN">一个 [remark](https://github.com/remarkjs/remark) 插件，用于使 GitHub Flavored Markdown（GFM）的删除线标记（`~~`）能够正确支持中文、日语和韩语文本。</span>

<span lang="ko">GitHub Flavored Markdown(GFM)의 취소선 기호(`~~`)를 한국어, 일본어, 중국어와 호환되도록 만드는 [remark](https://github.com/remarkjs/remark) 플러그인.</span>

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

This problem occurs because the character just inside the `**` is a (Japanese or Chinese) punctuation mark (。) or parenthesis and the character just outside is not a space or punctuation mark.

<span lang="ja">これが起こった原因は、終了側の`**`のすぐ内側が約物（。やカッコ）、かつ外側が約物や空白以外の文字であるためです。</span>

<span lang="zh-Hans-CN">这个问题是因为在`**`的结束部分，内侧字符是标点符号（。）或括号，而外侧字符不是空格或标点符号。</span>

<span lang="ko">이 문제는 `**` 바로 안쪽의 문자가 (일본어나 중국어) 문장 부호(。) 또는 괄호이고 바깥쪽 문자가 공백이나 문장 부호가 아니기 때문에 발생합니다.</span>

Of course, not only the end side but also the start side has the same issue.

<span lang="ja">もちろん終了側だけでなく、開始側も同様の問題が存在します。</span>

<span lang="zh-Hans-CN">当然，不仅是结束侧，开始侧也存在同样的问题。</span>

<span lang="ko">물론 끝나는 부분뿐만 아니라 시작하는 부분에서도 동일한 문제가 있습니다.</span>

CommonMark issue: https://github.com/commonmark/commonmark-spec/issues/650

This behavior is also applied to the strikethrough (`~~`) in GFM.

<span lang="ja">この挙動は、GFMの取り消し線（`~~`）にも該当します。</span>

<span lang="zh-Hans-CN">这个行为也适用于 GFM 的删除线（`~~`）。</span>

<span lang="ko">이 동작은 GFM의 취소선(`~~`)에도 해당됩니다.</span>

## Runtime Requirements / <span lang="ja">実行環境の要件</span> / <span lang="zh-Hans-CN">运行环境要求</span> / <span lang="ko">런타임 요구 사항</span>

This package is ESM-only. It requires Node.js 18 or later. (I have only tested it on 20 and later. There is no factor that would prevent it from working on 18, but I do not guarantee its operation on 18.)

<span lang="ja">本パッケージはESM専用です。Node.js 18以上が必要です。（動作検証は20以降でのみ行っています。18での動作を妨げる要因はありませんが、動作の保証はありません）</span>

<span lang="zh-Hans-CN">此包仅支持ESM。需要Node.js 18或更高版本。（我只测试了20及以后的版本。没有因素会阻止它在18上工作，但我不保证在18上的操作。）</span>

<span lang="ko">본 패키지는 ESM 전용입니다. Node.js 18 이상이 필요합니다. (동작 검증은 20 이후 버전에서만 수행했습니다. 18에서 동작을 방해하는 요인은 없으나, 동작을 보장하지는 않습니다)</span>

## Installation / <span lang="ja">インストール</span> / <span lang="zh-Hans-CN">安装</span> / <span lang="ko">설치</span>

Install `remark-cjk-friendly` via [npm](https://www.npmjs.com/):

<span lang="ja">`remark-cjk-friendly`を[npm](https://www.npmjs.com/)でインストールしてください。</span>

<span lang="zh-Hans-CN">通过 [npm](https://www.npmjs.com/) 安装 `remark-cjk-friendly`。</span>

<span lang="ko">`remark-cjk-friendly`를 [npm](https://www.npmjs.com/)으로 설치하세요.</span>

```bash
npm install remark-cjk-friendly
```

If you use another package manager, please replace `npm install` with the command of the package manager you use (e.g. `pnpm add` or `yarn add`).

<span lang="ja">npm以外のパッケージマネージャを使う場合は、`npm install`を当該パッケージマネージャのコマンド（例：`pnpm add`・`yarn add`）に置き換えてください。</span>

<span lang="zh-Hans-CN">如果使用其他包管理器，请将 `npm install` 替换为当时包管理器的命令（例如：`pnpm add`、`yarn add`）。</span>

<span lang="ko">npm이 아닌 다른 패키지 매니저를 사용하는 경우 `npm install`을 해당 패키지 매니저의 명령어(예: `pnpm add`, `yarn add`)로 바꿔 주세요.</span>

## Usage / <span lang="ja">使い方</span> / <span lang="zh-Hans-CN">用法</span> / <span lang="ko">사용법</span>

Import `remark-cjk-friendly-gfm-strikethrough` with other remark-related packages, and use the plugin as follows:

<span lang="ja">`remark-cjk-friendly-gfm-strikethrough`を他のremark関連パッケージと一緒にインポートし、次のようにプラグインを使用してください。</span>

<span lang="zh-Hans-CN">将 `remark-cjk-friendly-gfm-strikethrough` 与其他 remark 相关的包一起导入，然后使用插件如下:</span>

<span lang="ko">`remark-cjk-friendly-gfm-strikethrough`를 다른 remark 관련 패키지와 함께 가져온 후 다음과 같이 플러그인을 사용하세요.</span>

```js
import rehypeStringify from "rehype-stringify";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// e.g. in the case that you want to enable GFM and obtain HTML output
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendly)
  .use(remarkCjkFriendlyGfmStrikethrough)
  .use(remarkRehype)
  .use(rehypeStringify);

const htmlResult = (await processor.process(markdownString)).toString();
```

This plugin also wires the reverse path for `remark-stringify` / `mdast-util-to-markdown`, so CJK text around `~~` stays raw when it is valid under this specification instead of being escaped as character references. If you don't need this (only need Markdown parsing), or don't need parsing and only need this serialization, you can import from `remark-cjk-friendly-gfm-strikethrough/parseOnly` or `remark-cjk-friendly-gfm-strikethrough/serializeOnly` instead of `remark-cjk-friendly-gfm-strikethrough` to avoid bundling the unnecessary processing.

<span lang="ja">このプラグインは`remark-stringify` / `mdast-util-to-markdown`向けの逆方向シリアライズ拡張も自動で配線するため、この仕様で妥当なケースでは`~~`の前後にあるCJK文字が文字参照へエスケープされず、そのまま出力されます。これが不要（Markdownのパースのみが必要）、またはパースが不要でこのシリアライズのみが必要な場合は、`remark-cjk-friendly-gfm-strikethrough`の代わりにそれぞれ`remark-cjk-friendly-gfm-strikethrough/parseOnly`または`remark-cjk-friendly-gfm-strikethrough/serializeOnly`からインポートすると、不要な方の処理のバンドルを避けることができます。</span>

<span lang="zh-Hans-CN">此插件还会自动接入 `remark-stringify` / `mdast-util-to-markdown` 的反向序列化扩展，因此在本规范允许的情况下，`~~` 周围的 CJK 文字会保持原样输出，而不会被转义为字符引用。如果不需要此功能（仅需要 Markdown 解析），或者不需要解析仅需要序列化，可以分别从 `remark-cjk-friendly-gfm-strikethrough/parseOnly` 或 `remark-cjk-friendly-gfm-strikethrough/serializeOnly` 导入，而不是从 `remark-cjk-friendly-gfm-strikethrough` 导入，以避免打包不必要的处理。</span>

<span lang="ko">이 플러그인은 `remark-stringify` / `mdast-util-to-markdown`용 역방향 직렬화 확장도 자동으로 연결하므로, 이 사양에서 유효한 경우 `~~` 주변의 CJK 문자가 문자 참조로 이스케이프되지 않고 그대로 출력됩니다. 이 기능이 필요 없는 경우（Markdown 파싱만 필요）또는 파싱이 필요 없고 직렬화만 필요한 경우, `remark-cjk-friendly-gfm-strikethrough` 대신 각각 `remark-cjk-friendly-gfm-strikethrough/parseOnly` 또는 `remark-cjk-friendly-gfm-strikethrough/serializeOnly`에서 가져오면 불필요한 처리 번들을 피할 수 있습니다.</span>

> [!IMPORTANT]
> You must place `remarkCjkFriendlyGfmStrikethrough` between `remarkGfm` and `remarkRehype`. If it is put before `remarkGfm`, this plugin will not work.
>
> <span lang="ja">`remarkCjkFriendlyGfmStrikethrough`は`remarkGfm`と`remarkRehype`の間に配置してください。`remarkGfm`より前に配置すると、このプラグインは動作しません。</span>
>
> <span lang="zh-Hans-CN">`remarkCjkFriendlyGfmStrikethrough` 应放在 `remarkGfm` 和 `remarkRehype` 之间。如果将它放在 `remarkGfm` 之前，该插件将无法工作。</span>
>
> <span lang="ko">`remarkCjkFriendlyGfmStrikethrough`는 `remarkGfm`과 `remarkRehype` 사이에 배치해야 합니다.`remarkGfm`보다 앞에 배치하면 이 플러그인은 작동하지 않습니다.</span>

For MDX, add `remarkCjkFriendlyGfmStrikethrough` to the `remarkPlugins` array in the config object:

<span lang="ja">MDXでは、設定オブジェクトの`remarkPlugins`配列に`remarkCjkFriendlyGfmStrikethrough`を追加してください。</span>

<span lang="zh-Hans-CN">对于 MDX，将 `remarkCjkFriendlyGfmStrikethrough` 添加到配置对象的 `remarkPlugins` 数组中。</span>

<span lang="ko">MDX의 경우 설정 객체의 `remarkPlugins` 배열에 `remarkCjkFriendlyGfmStrikethrough`를 추가해 주세요.</span>

```js
const someMdxConfig = {
  remarkPlugins: [remarkGfm, remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough, ...otherRemarkPlugins],
  rehypePlugins: [...someRehypePlugins],
};
```

> [!IMPORTANT]
> Place `remarkCjkFriendlyGfmStrikethrough` after `remarkGfm`, or `remarkCjkFriendlyGfmStrikethrough` will not work.
>
> <span lang="ja">`remarkCjkFriendlyGfmStrikethrough`は`remarkGfm`の後に配置してください。さもなければ、`remarkCjkFriendlyGfmStrikethrough`が動作しません。</span>
>
> <span lang="zh-Hans-CN">将 `remarkCjkFriendlyGfmStrikethrough` 放在 `remarkGfm` 后面，否则 `remarkCjkFriendlyGfmStrikethrough` 将无法工作。</span>
>
> <span lang="ko">`remarkCjkFriendlyGfmStrikethrough`는 `remarkGfm` 뒤에 배치해야 합니다. 그렇게 하지 않으면 `remarkCjkFriendlyGfmStrikethrough`가 작동하지 않습니다.</span>

This plugin is not compatible with Rust-based remark-compatible Markdown/MDX parsers, including the following:

- [mdx-rs](https://crates.io/crates/mdx-rs) crate
- [@rspress/mdx-rs](https://github.com/web-infra-dev/mdx-rs) package
- [Sätteri](https://satteri.bruits.org/)

When using this plugin, you need to use the real remark parser that internally uses micromark, which is implemented in pure JavaScript and thus monkey-patchable, instead of these parsers. Here are well-known use cases. If applicable, please take the corresponding workaround.

| Well-known use case | Workaround |
| --- | --- |
| `mdxRs` option in [Rspress 1.x](https://v1.rspress.rs/guide/basic/use-mdx#disabling-the-rust-version-compiler) | Set it to `false` |
| `mdxRs` option in [Next.js (`@next/mdx`)](https://nextjs.org/docs/pages/building-your-application/configuring/mdx#using-the-rust-based-mdx-compiler-experimental) | Set it to `false` |
| Astro 6.4 or later | Use `@astrojs/markdown-remark` instead of `@astrojs/markdown-satteri` |

<div lang="ja">

本プラグインは、次を含むRustベースのremark互換のMarkdown・MDXパーサと互換性がありません。

- [mdx-rs](https://crates.io/crates/mdx-rs)クレート
- [@rspress/mdx-rs](https://github.com/web-infra-dev/mdx-rs)パッケージ
- [Sätteri](https://satteri.bruits.org/)

本プラグインを使う場合、これらのパーサではなく、純JavaScriptで実装されているためモンキーパッチ可能なパーサmicromarkを中で使用している、本物のremarkパーサを使う必要があります。次のような利用先が有名です。当てはまる場合は、対応する回避策を取ってください。

| 有名な利用先 | 回避策 |
| --- | --- |
| [Rspress 1.x](https://v1.rspress.rs/guide/basic/use-mdx#disabling-the-rust-version-compiler)の`mdxRs`オプション | `false`にしてください |
| [Next.js（`@next/mdx`）](https://nextjs.org/docs/pages/building-your-application/configuring/mdx#using-the-rust-based-mdx-compiler-experimental)の`mdxRs`オプション | `false`にしてください |
| Astro 6.4以降 | `@astrojs/markdown-satteri`ではなく、`@astrojs/markdown-remark`を使ってください |

</div>

<div lang="zh-Hans-CN">

本插件与以下Rust语言实现的remark兼容的Markdown/MDX解析器不兼容：

- [mdx-rs](https://crates.io/crates/mdx-rs) crate
- [@rspress/mdx-rs](https://github.com/web-infra-dev/mdx-rs) 包
- [Sätteri](https://satteri.bruits.org/)

使用本插件时，需要使用内部使用micromark（由纯JavaScript实现，因此可以进行猴子补丁）的真正的remark解析器，而不是这些解析器。以下是常见的使用场景，如果适用，请采取相应的解决方法。

| 常见使用场景 | 解决方法 |
| --- | --- |
| [Rspress 1.x](https://v1.rspress.rs/zh/guide/basic/use-mdx#%E5%85%B3%E9%97%AD-rust-%E7%89%88%E6%9C%AC%E7%BC%96%E8%AF%91%E5%99%A8)的`mdxRs`选项 | 请设置为`false` |
| [Next.js（`@next/mdx`）](https://nextjs.org/docs/pages/building-your-application/configuring/mdx#using-the-rust-based-mdx-compiler-experimental)的`mdxRs`选项 | 请设置为`false` |
| Astro 6.4及以后版本 | 请使用`@astrojs/markdown-remark`而不是`@astrojs/markdown-satteri` |

</div>

<div lang="ko">

이 플러그인은 다음을 포함하는 Rust 기반의 remark 호환 Markdown/MDX 파서와 호환되지 않습니다.

- [mdx-rs](https://crates.io/crates/mdx-rs) 크레이트
- [@rspress/mdx-rs](https://github.com/web-infra-dev/mdx-rs) 패키지
- [Sätteri](https://satteri.bruits.org/)

이 플러그인을 사용할 때는 이러한 파서 대신, 순수 JavaScript로 구현되어 있어 몽키 패치가 가능한 micromark를 내부적으로 사용하는 진정한 remark 파서를 사용해야 합니다. 다음과 같은 잘 알려진 사용처가 있습니다. 해당하는 경우에는 그에 맞는 해결 방법을 적용하세요.

| 잘 알려진 사용처 | 해결 방법 |
| --- | --- |
| [Rspress 1.x](https://v1.rspress.rs/guide/basic/use-mdx#disabling-the-rust-version-compiler)의 `mdxRs` 옵션 | `false`로 설정하세요 |
| [Next.js（`@next/mdx`）](https://nextjs.org/docs/pages/building-your-application/configuring/mdx#using-the-rust-based-mdx-compiler-experimental)의 `mdxRs` 옵션 | `false`로 설정하세요 |
| Astro 6.4 이후 | `@astrojs/markdown-satteri` 대신 `@astrojs/markdown-remark`를 사용하세요 |

</div>

## Compatibility with the other languages / <span lang="ja">他言語との互換性</span> / <span lang="zh-Hans-CN">与其他语言的兼容性</span> / <span lang="ko">다른 언어와의 호환성</span>

This modification of the specification does not affect the other languages than Chinese, Japanese, and Korean. Even if your application or document has translations or content in other languages, it will not be affected, so please feel free to use this packages. I assure that even with this package, remark still outputs the same HTML for all test cases in cmark-gfm as of 0.29.0.gfm.13.

<span lang="ja">この仕様変更提案は、日本語・中国語・韓国語以外の言語には影響しません。アプリケーションやドキュメントに他言語の翻訳やコンテンツが含まれていても影響はありませんので、安心して本パッケージをご利用ください。本パッケージを使用しても、0.29.0.gfm.13時点のcmark-gfmの全てのテストケースで、remarkが同じHTMLを出力することを保証しています。</span>

<span lang="zh-Hans-CN">除中文、日文和韩文外，建议的规范变更不会影响其他语言。请放心使用此软件包，因为如果您的应用程序或文档包含其他语言的翻译或内容，也不会受到影响。我保证，即使使用此软件包，remark 仍然会为 0.29.0.gfm.13 版本的所有 cmark-gfm 测试用例输出相同的 HTML。</span>

<span lang="ko">이 사양 변경 제안은 한국어, 일본어, 중국어 이외의 언어에는 영향을 미치지 않습니다. 애플리케이션이나 문서에 다른 언어의 번역이나 콘텐츠가 포함되어 있어도 영향을 받지 않으므로 안심하고 본 패키지를 사용하시기 바랍니다. 본 패키지를 사용해도 0.29.0.gfm.13 기준 cmark-gfm.13의 모든 테스트 케이스에서 mark가 동일한 HTML을 출력하도록 보장합니다.</span>

## Specification / <span lang="ja">規格書</span> / <span lang="zh-Hans-CN">规范</span> / <span lang="ko">설명서</span>

The condition for `~~` to be recognized as a strikeout is the same as the condition for `**` to be recognized as emphasis in the following CommonMark specification amendment suggestion:

https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md (English)

## Related packages / <span lang="ja">関連パッケージ</span> / <span lang="zh-Hans-CN">相关包</span> / <span lang="ko">관련 패키지</span>

- [remark-cjk-friendly](https://npmjs.com/package/remark-cjk-friendly) [![Version](https://img.shields.io/npm/v/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) ![Node Current](https://img.shields.io/node/v/remark-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/remark-cjk-friendly)](https://socket.dev/npm/package/remark-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/remark-cjk-friendly)
- [mdast-util-to-markdown-cjk-friendly-gfm-strikethrough](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![Version](https://img.shields.io/npm/v/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) ![Node Current](https://img.shields.io/node/v/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![NPM Downloads](https://img.shields.io/npm/dm/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![NPM Last Update](https://img.shields.io/npm/last-update/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![Socket Badge](https://badge.socket.dev/npm/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://socket.dev/npm/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [\[Snyk Security\]](https://security.snyk.io/package/npm/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)
- [micromark-extension-cjk-friendly](https://npmjs.com/package/micromark-extension-cjk-friendly) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) ![Node Current](https://img.shields.io/node/v/micromark-extension-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/micromark-extension-cjk-friendly)](https://socket.dev/npm/package/micromark-extension-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/micromark-extension-cjk-friendly)
  - [micromark-extension-cjk-friendly-util](https://npmjs.com/package/micromark-extension-cjk-friendly-util) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly-util)](https://npmjs.com/package/micromark-extension-cjk-friendly-util) ![Node Current](https://img.shields.io/node/v/micromark-extension-cjk-friendly-util) [![NPM Downloads](https://img.shields.io/npm/dm/micromark-extension-cjk-friendly-util)](https://npmjs.com/package/micromark-extension-cjk-friendly-util) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly-util)](https://npmjs.com/package/micromark-extension-cjk-friendly-util) [![Socket Badge](https://badge.socket.dev/npm/package/micromark-extension-cjk-friendly-util)](https://socket.dev/npm/package/micromark-extension-cjk-friendly-util) [\[Snyk Security\]](https://security.snyk.io/package/npm/micromark-extension-cjk-friendly-util)
  - [micromark-extension-cjk-friendly-gfm-strikethrough](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) ![Node Current](https://img.shields.io/node/v/micromark-extension-cjk-friendly-gfm-strikethrough) [![NPM Downloads](https://img.shields.io/npm/dm/micromark-extension-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) [![Socket Badge](https://badge.socket.dev/npm/package/micromark-extension-cjk-friendly-gfm-strikethrough)](https://socket.dev/npm/package/micromark-extension-cjk-friendly-gfm-strikethrough) [\[Snyk Security\]](https://security.snyk.io/package/npm/micromark-extension-cjk-friendly-gfm-strikethrough)

- [markdown-it-cjk-friendly](https://npmjs.com/package/markdown-it-cjk-friendly) [![Version](https://img.shields.io/npm/v/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly) ![Node Current](https://img.shields.io/node/v/markdown-it-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/markdown-it-cjk-friendly)](https://npmjs.com/package/markdown-it-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/markdown-it-cjk-friendly)](https://socket.dev/npm/package/markdown-it-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/markdown-it-cjk-friendly)
- [marked-cjk-friendly](https://npmjs.com/package/marked-cjk-friendly) [![Version](https://img.shields.io/npm/v/marked-cjk-friendly)](https://npmjs.com/package/marked-cjk-friendly) ![Node Current](https://img.shields.io/node/v/marked-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/marked-cjk-friendly)](https://npmjs.com/package/marked-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/marked-cjk-friendly)](https://npmjs.com/package/marked-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/marked-cjk-friendly)](https://socket.dev/npm/package/marked-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/marked-cjk-friendly)

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

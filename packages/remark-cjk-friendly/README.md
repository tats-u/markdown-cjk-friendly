# remark-cjk-friendly

[![Version](https://img.shields.io/npm/v/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) ![Node Current](https://img.shields.io/node/v/remark-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/remark-cjk-friendly)](https://npmjs.com/package/remark-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/remark-cjk-friendly)](https://socket.dev/npm/package/remark-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/remark-cjk-friendly)

A [remark](https://github.com/remarkjs/remark) plugin to make Markdown emphasis (`**`) in CommonMark (and MDX) compatible with Chinese, Japanese, and Korean (CJK).

<span lang="ja">CommonMark（・MDX）の強調記号(`**`)を日本語・中国語・韓国語にきちんと対応させるための[remark](https://github.com/remarkjs/remark)プラグイン</span>

<span lang="zh-Hans-CN">一个 [remark](https://github.com/remarkjs/remark) 插件，用于使 CommonMark（和 MDX）的强调标记(`**`)能够正确支持中文、日语和韩语文本。</span>

<span lang="ko">CommonMark(및 MDX)의 강조 표시(`**`)를 한국어, 일본어, 중국어와 호환되도록 만드는 [remark](https://github.com/remarkjs/remark) 플러그인.</span>

> [!NOTE]
> This package does not support the strikethrough syntax (`~~`) in GFM (GitHub Flavored Markdown). If you want to support it, please use [`remark-cjk-friendly-gfm-strikethrough`](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) along with this package.
>
> <span lang="ja">本パッケージはGitHub Flavored Markdown（GFM）の取り消し線（`~~`）に対応しません。対応させたい場合は、[`remark-cjk-friendly-gfm-strikethrough`](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough)を併用してください。</span>
>
> <span lang="zh-Hans-CN">本包不支持 GitHub Flavored Markdown（GFM）的删除线（`~~`）。如果需要支持，请同时使用 [`remark-cjk-friendly-gfm-strikethrough`](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough)。</span>
>
> <span lang="ko">이 패키지는 GitHub Flavored Markdown(GFM)의 취소선(`~~`)을 지원하지 않습니다. 지원하고 싶은 경우에는 [`remark-cjk-friendly-gfm-strikethrough`](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough)를 함께 사용해 주세요.</span>

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

## Demo / <span lang="ja">デモ</span> / <span lang="zh-Hans-CN">演示</span> / <span lang="ko">데모</span>

https://tats-u.github.io/markdown-cjk-friendly

## When should I use this? / <span lang="ja">このパッケージを使うべき場合</span> / <span lang="zh-Hans-CN">何时使用此包</span> / <span lang="ko">이 패키지를 사용해야 하는 경우</span>

If you are an engineer who must handle Chinese, Japanese, and Korean content that cannot be fully supervised, it is strongly recommended to use this package (adopt this specification instead of plain CommonMark or GFM). "Cannot be fully supervised" refers to situations such as:

1. When you need to display user-generated or AI-generated content as-is
2. When many translators do not understand this CommonMark behavior, and you cannot provide real-time rendering previews similar to production, and `<strong>` tags are not allowed
    - When using translation services like Crowdin or Transifex
    - When the person responsible for translation quality is not an engineer or does not understand this CommonMark behavior

Additionally, if you are creating Markdown-related software or services primarily targeting Chinese, Japanese, or Korean users (or all of them), it is strongly recommended to use this package (adopt this specification).

<span lang="ja">もしエンジニアであるあなたが全てに監修を入れられない日本語・中国語・韓国語のコンテンツを扱わなければならない場合、このパッケージを使う（素のCommonMarkやGFMではなく、この仕様を採用する）ことを強く推奨します。「全てに監修を入れられない」というのは、例えば次のようなものを指します。</span>

1. <span lang="ja">ユーザまたはAIが作成したコンテンツをそのまま表示する必要がある場合</span>
2. <span lang="ja">翻訳者に、このCommonMarkの仕様を理解していない人も多く、なおかつリアルタイムで本番同様の描画プレビューを提供できず、`<strong>`タグを許可していない場合</span>
    - <span lang="ja">翻訳にCrowdin・Transifexなどの翻訳サービスを使っている場合</span>
    - <span lang="ja">翻訳の品質に責任を負っている人が非エンジニアである、またはCommonMarkのこの挙動を理解していない場合</span>

<span lang="ja">また、あなたが主に日本人・中国人・韓国人のいずれかまたは全てを対象としたMarkdown関連のソフトウェアやサービスを作成する場合も、このパッケージを使う（この仕様を採用する）ことを強く推奨します。</span>

<span lang="zh-Hans-CN">如果作为工程师的您必须处理无法全面监督的中文、日文和韩文内容，强烈建议使用这个包装（采用此规范，而不是普通的CommonMark或GFM）。"无法全面监督"指的是以下情况：</span>

1. <span lang="zh-Hans-CN">当需要按原样显示用户生成或AI生成的内容时</span>
2. <span lang="zh-Hans-CN">当许多翻译人员不理解这个CommonMark行为，而且无法提供类似生产环境的实时渲染预览，并且不允许使用`<strong>`标签时</span>
    - <span lang="zh-Hans-CN">当使用Crowdin或Transifex等翻译服务时</span>
    - <span lang="zh-Hans-CN">当负责翻译质量的人不是工程师或不理解这个CommonMark行为时</span>

<span lang="zh-Hans-CN">此外，如果您正在创建主要面向中国人、日本人或韩国人（或全部）的Markdown相关软件或服务，也强烈建议采用此规范。</span>

<span lang="ko">엔지니어로서 완전히 감독할 수 없는 일본어, 중국어, 한국어 콘텐츠를 다뤄야 하는 경우 이 패키지를 사용(일반 CommonMark나 GFM 대신 이 사양을 채택)할 것을 강력히 권장합니다. '완전히 감독할 수 없는'이란 다음과 같은 상황을 의미합니다.</span>

1. <span lang="ko">사용자 또는 AI가 생성한 콘텐츠를 그대로 표시해야 하는 경우</span>
2. <span lang="ko">많은 번역자가 CommonMark의 동작을 이해하지 못하고, 실시간으로 실제 환경과 유사한 렌더링 미리보기를 제공할 수 없으며, `<strong>` 태그가 허용되지 않는 경우</span>
    - <span lang="ko">Crowdin이나 Transifex 같은 번역 서비스를 사용하는 경우</span>
    - <span lang="ko">번역 품질에 책임을 지는 사람이 엔지니어가 아니거나 CommonMark의 동작을 이해하지 못하는 경우</span>

<span lang="ko">또한, 주로 한국어, 일본어, 중국어 사용자(또는 모두)를 대상으로 하는 Markdown 관련 소프트웨어나 서비스를 만들고 있다면 이 패키지를 사용(이 사양을 채택)할 것을 강력히 권장합니다.</span>

### Example of 1. (Chinese) / <span lang="ja">1.の例（中国語）</span> / <span lang="zh-Hans-CN">1.的例子</span> / <span lang="ko">1.의 예시(중국어)</span>:

❌️Plain CommonMark / <span lang="ja">素のCommonMark</span> / <span lang="zh-Hans-CN">原生CommonMark</span> / <span lang="ko">기본 CommonMark</span>:

![plain CommonMark](https://github.com/user-attachments/assets/80bd3ffd-9416-4080-bc10-a408afef845b)

✅️With this spec / <span lang="ja">本規格</span> / <span lang="zh-Hans-CN">这个规范</span> / <span lang="ko">이 사양</span>:

![with this spec](https://github.com/user-attachments/assets/b2e159c5-3cae-495f-89c6-280ddb2926ce)

Image source: [CherryHQ/cherry-studio#4119](https://github.com/CherryHQ/cherry-studio/pull/4119)

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

Import `remark-cjk-friendly` with other remark-related packages, and use the plugin as follows:

<span lang="ja">`remark-cjk-friendly`を他のremark関連パッケージと一緒にインポートし、次のようにプラグインを使用してください。</span>

<span lang="zh-Hans-CN">将 `remark-cjk-friendly` 与其他 remark 相关的包一起导入，然后使用插件如下:</span>

<span lang="ko">`remark-cjk-friendly`를 다른 remark 관련 패키지와 함께 가져온 후 다음과 같이 플러그인을 사용하세요.</span>

```js
import rehypeStringify from "rehype-stringify";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// e.g. in the case that you want to enable GFM and obtain HTML output
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendly)
  .use(remarkRehype)
  .use(rehypeStringify);

const htmlResult = (await processor.process(markdownString)).toString();
```

This plugin also wires the reverse path for `remark-stringify` / `mdast-util-to-markdown`, so CJK text around `*` / `**` stays raw when it is valid under this specification instead of being escaped as character references. Since this serialization feature may be removed from the default entry point of `remark-cjk-friendly` in a future version, it is strongly recommended to import from `remark-cjk-friendly/bidi`. For users who only need parsing or serialization and want to minimize bundle size (reduces a few KB), import from `remark-cjk-friendly/parseOnly` or `remark-cjk-friendly/serializeOnly` respectively.

| Entry point | Parsing (Markdown → AST) | Serialization (AST → Markdown) |
| --- | --- | --- |
| `remark-cjk-friendly` | ✅ | ⚠️ |
| `remark-cjk-friendly/bidi` | ✅ | ✅ |
| `remark-cjk-friendly/parseOnly` | ✅ | ❌ |
| `remark-cjk-friendly/serializeOnly` | ❌ | ✅ |

<div lang="ja">

このプラグインは`remark-stringify` / `mdast-util-to-markdown`向けの逆方向シリアライズ拡張にも対応しており、この仕様で妥当なケースでは`*` / `**`の前後にあるCJK文字が文字参照へエスケープされず、そのまま出力されます。このシリアライズ機能は将来のバージョンで`remark-cjk-friendly`のデフォルトのエントリポイントから削除するかもしれませんので、`remark-cjk-friendly/bidi`からインポートすることを強く推奨します。また、パース・シリアライズの片方しか使わない場合でバンドルサイズを最小限に抑えたい場合（数KB削減）は、`remark-cjk-friendly/parseOnly`または`remark-cjk-friendly/serializeOnly`からインポートしてください。

| エントリポイント | パース（Markdown → AST） | シリアライズ（AST → Markdown） |
| --- | --- | --- |
| `remark-cjk-friendly` | ⭕️ | ⚠️ |
| `remark-cjk-friendly/bidi` | ⭕️ | ⭕️ |
| `remark-cjk-friendly/parseOnly` | ⭕️ | ❌ |
| `remark-cjk-friendly/serializeOnly` | ❌ | ⭕️ |

</div>

<div lang="zh-Hans-CN">

此插件还会自动接入 `remark-stringify` / `mdast-util-to-markdown` 的反向序列化扩展，因此在本规范允许的情况下，`*` / `**` 周围的 CJK 文字会保持原样输出，而不会被转义为字符引用。由于此序列化功能可能在未来版本中从 `remark-cjk-friendly` 的默认入口点中删除，强烈建议从 `remark-cjk-friendly/bidi` 导入。如果只需要解析或序列化其中之一，并希望尽量减小打包体积（可减少数KB），请分别从 `remark-cjk-friendly/parseOnly` 或 `remark-cjk-friendly/serializeOnly` 导入。

| 入口点 | 解析（Markdown → AST） | 序列化（AST → Markdown） |
| --- | --- | --- |
| `remark-cjk-friendly` | ✅ | ⚠️ |
| `remark-cjk-friendly/bidi` | ✅ | ✅ |
| `remark-cjk-friendly/parseOnly` | ✅ | ❌ |
| `remark-cjk-friendly/serializeOnly` | ❌ | ✅ |

</div>

<div lang="ko">

이 플러그인은 `remark-stringify` / `mdast-util-to-markdown`용 역방향 직렬화 확장도 자동으로 연결하므로, 이 사양에서 유효한 경우 `*` / `**` 주변의 CJK 문자가 문자 참조로 이스케이프되지 않고 그대로 출력됩니다. 이 직렬화 기능은 향후 버전에서 `remark-cjk-friendly`의 기본 엔트리 포인트에서 제거될 수 있으므로, `remark-cjk-friendly/bidi`에서 가져오는 것을 강력히 권장합니다. 파싱과 직렬화 중 하나만 필요하고 번들 크기를 최소화하려는 경우（수 KB 절감）에는 각각 `remark-cjk-friendly/parseOnly` 또는 `remark-cjk-friendly/serializeOnly`에서 가져오세요.

| 엔트리 포인트 | 파싱（Markdown → AST） | 직렬화（AST → Markdown） |
| --- | --- | --- |
| `remark-cjk-friendly` | ⭕️ | ⚠️ |
| `remark-cjk-friendly/bidi` | ⭕️ | ⭕️ |
| `remark-cjk-friendly/parseOnly` | ⭕️ | ❌ |
| `remark-cjk-friendly/serializeOnly` | ❌ | ⭕️ |

</div>

For MDX, add `remarkCjkFriendly` to the `remarkPlugins` array in the config object:

<span lang="ja">MDXでは、設定オブジェクトの`remarkPlugins`配列に`remarkCjkFriendly`を追加してください。</span>

<span lang="zh-Hans-CN">对于 MDX，将 `remarkCjkFriendly` 添加到配置对象的 `remarkPlugins` 数组中。</span>

<span lang="ko">MDX의 경우 설정 객체의 `remarkPlugins` 배열에 `remarkCjkFriendly`를 추가해 주세요.</span>

```js
const someMdxConfig = {
  remarkPlugins: [remarkGfm, remarkCjkFriendly, ...otherRemarkPlugins],
  rehypePlugins: [...someRehypePlugins],
};
```

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

This modification of the specification does not affect the other languages than Chinese, Japanese, and Korean. Even if your application or document has translations or content in other languages, it will not be affected, so please feel free to use this packages. I assure that even with this package (amendment suggestion), remark still outputs the same HTML for all CommonMark test cases as of 0.31.2.

<span lang="ja">この仕様変更提案は、日本語・中国語・韓国語以外の言語には影響しません。アプリケーションやドキュメントに他言語の翻訳やコンテンツが含まれていても影響はありませんので、安心して本パッケージをご利用ください。本パッケージ（修正案）を使用しても、0.31.2時点の全てのCommonMarkテストケースで、remarkが同じHTMLを出力することを保証しています。</span>

<span lang="zh-Hans-CN">除中文、日文和韩文外，建议的规范变更不会影响其他语言。请放心使用此软件包，因为如果您的应用程序或文档包含其他语言的翻译或内容，也不会受到影响。我保证，即使使用此软件包（修正建议），remark 仍然会为 0.31.2 版本的所有 CommonMark 测试用例输出相同的 HTML。</span>

<span lang="ko">이 사양 변경 제안은 한국어, 일본어, 중국어 이외의 언어에는 영향을 미치지 않습니다. 애플리케이션이나 문서에 다른 언어의 번역이나 콘텐츠가 포함되어 있어도 영향을 받지 않으므로 안심하고 본 패키지를 사용하시기 바랍니다. 본 패키지(수정안)를 사용해도 0.31.2 시점의 모든 CommonMark 테스트 케이스에서 remark가 동일한 HTML을 출력하는 것을 보장합니다.</span>

## Specification / <span lang="ja">規格書</span> / <span lang="zh-Hans-CN">规范</span> / <span lang="ko">설명서</span>

https://github.com/tats-u/markdown-cjk-friendly/blob/main/specification.md (English)

## Related packages / <span lang="ja">関連パッケージ</span> / <span lang="zh-Hans-CN">相关包</span> / <span lang="ko">관련 패키지</span>

- [remark-cjk-friendly-gfm-strikethrough](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) [![Version](https://img.shields.io/npm/v/remark-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) ![Node Current](https://img.shields.io/node/v/remark-cjk-friendly-gfm-strikethrough) [![NPM Downloads](https://img.shields.io/npm/dm/remark-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) [![NPM Last Update](https://img.shields.io/npm/last-update/remark-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/remark-cjk-friendly-gfm-strikethrough) [![Socket Badge](https://badge.socket.dev/npm/package/remark-cjk-friendly-gfm-strikethrough)](https://socket.dev/npm/package/remark-cjk-friendly-gfm-strikethrough) [\[Snyk Security\]](https://security.snyk.io/package/npm/remark-cjk-friendly-gfm-strikethrough)
- [micromark-extension-cjk-friendly](https://npmjs.com/package/micromark-extension-cjk-friendly) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) ![Node Current](https://img.shields.io/node/v/micromark-extension-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly)](https://npmjs.com/package/micromark-extension-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/micromark-extension-cjk-friendly)](https://socket.dev/npm/package/micromark-extension-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/micromark-extension-cjk-friendly)
  - [micromark-extension-cjk-friendly-util](https://npmjs.com/package/micromark-extension-cjk-friendly-util) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly-util)](https://npmjs.com/package/micromark-extension-cjk-friendly-util) ![Node Current](https://img.shields.io/node/v/micromark-extension-cjk-friendly-util) [![NPM Downloads](https://img.shields.io/npm/dm/micromark-extension-cjk-friendly-util)](https://npmjs.com/package/micromark-extension-cjk-friendly-util) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly-util)](https://npmjs.com/package/micromark-extension-cjk-friendly-util) [![Socket Badge](https://badge.socket.dev/npm/package/micromark-extension-cjk-friendly-util)](https://socket.dev/npm/package/micromark-extension-cjk-friendly-util) [\[Snyk Security\]](https://security.snyk.io/package/npm/micromark-extension-cjk-friendly-util)
  - [micromark-extension-cjk-friendly-gfm-strikethrough](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) [![Version](https://img.shields.io/npm/v/micromark-extension-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) ![Node Current](https://img.shields.io/node/v/micromark-extension-cjk-friendly-gfm-strikethrough) [![NPM Downloads](https://img.shields.io/npm/dm/micromark-extension-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) [![NPM Last Update](https://img.shields.io/npm/last-update/micromark-extension-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/micromark-extension-cjk-friendly-gfm-strikethrough) [![Socket Badge](https://badge.socket.dev/npm/package/micromark-extension-cjk-friendly-gfm-strikethrough)](https://socket.dev/npm/package/micromark-extension-cjk-friendly-gfm-strikethrough) [\[Snyk Security\]](https://security.snyk.io/package/npm/micromark-extension-cjk-friendly-gfm-strikethrough)
- [mdast-util-to-markdown-cjk-friendly](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly) [![Version](https://img.shields.io/npm/v/mdast-util-to-markdown-cjk-friendly)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly) ![Node Current](https://img.shields.io/node/v/mdast-util-to-markdown-cjk-friendly) [![NPM Downloads](https://img.shields.io/npm/dm/mdast-util-to-markdown-cjk-friendly)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly) [![NPM Last Update](https://img.shields.io/npm/last-update/mdast-util-to-markdown-cjk-friendly)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly) [![Socket Badge](https://badge.socket.dev/npm/package/mdast-util-to-markdown-cjk-friendly)](https://socket.dev/npm/package/mdast-util-to-markdown-cjk-friendly) [\[Snyk Security\]](https://security.snyk.io/package/npm/mdast-util-to-markdown-cjk-friendly)
  - [mdast-util-to-markdown-cjk-friendly-gfm-strikethrough](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![Version](https://img.shields.io/npm/v/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) ![Node Current](https://img.shields.io/node/v/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![NPM Downloads](https://img.shields.io/npm/dm/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![NPM Last Update](https://img.shields.io/npm/last-update/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://npmjs.com/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [![Socket Badge](https://badge.socket.dev/npm/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)](https://socket.dev/npm/package/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough) [\[Snyk Security\]](https://security.snyk.io/package/npm/mdast-util-to-markdown-cjk-friendly-gfm-strikethrough)
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

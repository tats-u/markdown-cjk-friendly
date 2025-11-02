import markdownIt from "markdown-it";
import markdownItCjkFriendlyPlugin from "markdown-it-cjk-friendly";
import { micromark } from "micromark";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { gfmStrikethroughCjkFriendly } from "micromark-extension-cjk-friendly-gfm-strikethrough";
import { gfm, gfmHtml } from "micromark-extension-gfm";

export type MarkdownProcessorName = "micromark" | "markdown-it";

const extensionsWithoutGfm = [cjkFriendlyExtension()];
const extensionsWithGfmNoCjkFriendly = [gfm()];
const extensionsWithGfm = [
  ...extensionsWithoutGfm,
  ...extensionsWithGfmNoCjkFriendly,
  gfmStrikethroughCjkFriendly(),
];
const gfmHtmlExtensions = [gfmHtml()];

type MarkdownToHTMLRenderer = (markdown: string) => string;
type GfmPlainRendererSet = {
  gfm: MarkdownToHTMLRenderer | undefined;
  plain: MarkdownToHTMLRenderer | undefined;
};

type RendererStore = {
  [key in MarkdownProcessorName]: {
    cjkFriendly: GfmPlainRendererSet;
    noFriendly: GfmPlainRendererSet;
  };
};

const rendererStore: RendererStore = {
  micromark: {
    cjkFriendly: {
      gfm: undefined,
      plain: undefined,
    },
    noFriendly: {
      gfm: undefined,
      plain: undefined,
    },
  },
  "markdown-it": {
    cjkFriendly: {
      gfm: undefined,
      plain: undefined,
    },
    noFriendly: {
      gfm: undefined,
      plain: undefined,
    },
  },
};

function createMarkdownItRenderer(
  cjkFriendly: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const md = gfm
    ? markdownIt({ html: false, linkify: true })
    : markdownIt("commonmark");
  if (cjkFriendly) {
    md.use(markdownItCjkFriendlyPlugin);
  }
  return (source: string) => md.render(source);
}

function createMicromarkRenderer(
  cjkFriendly: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const extensions = gfm
    ? cjkFriendly
      ? extensionsWithGfm
      : extensionsWithGfmNoCjkFriendly
    : cjkFriendly
      ? extensionsWithoutGfm
      : null;
  return (md: string) =>
    micromark(md, {
      extensions,
      htmlExtensions: gfm ? gfmHtmlExtensions : null,
    });
}

function createRenderer(
  engine: MarkdownProcessorName,
  cjkFriendly: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  if (engine === "markdown-it") {
    return createMarkdownItRenderer(cjkFriendly, gfm);
  }
  return createMicromarkRenderer(cjkFriendly, gfm);
}

export function getRenderer(
  engine: MarkdownProcessorName,
  cjkFriendly: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const target: GfmPlainRendererSet = cjkFriendly
    ? rendererStore[engine].cjkFriendly
    : rendererStore[engine].noFriendly;
  if (gfm) {
    target.gfm ??= createRenderer(engine, cjkFriendly, true);
    return target.gfm;
  }
  target.plain ??= createRenderer(engine, cjkFriendly, false);
  return target.plain;
}

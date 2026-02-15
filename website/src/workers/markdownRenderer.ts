import {
  createMarkdownExit,
  type PluginSimple as MarkdownExitPluginSimple,
} from "markdown-exit";
import markdownIt from "markdown-it";
import markdownItCjkFriendlyPlugin from "markdown-it-cjk-friendly";
import { micromark } from "micromark";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { gfmStrikethroughCjkFriendly } from "micromark-extension-cjk-friendly-gfm-strikethrough";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import type { LoadedPlugins } from "./pluginLoader";

export type MarkdownProcessorName =
  | "micromark"
  | "markdown-it"
  | "markdown-exit";

const markdownProcessorNames = new Set<MarkdownProcessorName>([
  "micromark",
  "markdown-it",
  "markdown-exit",
]);

export function normalizeMarkdownProcessorName(
  engine: string,
): MarkdownProcessorName {
  if (markdownProcessorNames.has(engine as MarkdownProcessorName)) {
    return engine as MarkdownProcessorName;
  }
  return "micromark";
}

const extensionsWithoutGfm = [cjkFriendlyExtension()];
const extensionsWithGfmInferior = [gfm()];
const extensionsWithGfm = [
  ...extensionsWithoutGfm,
  ...extensionsWithGfmInferior,
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
    superior: GfmPlainRendererSet;
    inferior: GfmPlainRendererSet;
  };
};

const rendererStore: RendererStore = {
  micromark: {
    superior: {
      gfm: undefined,
      plain: undefined,
    },
    inferior: {
      gfm: undefined,
      plain: undefined,
    },
  },
  "markdown-it": {
    superior: {
      gfm: undefined,
      plain: undefined,
    },
    inferior: {
      gfm: undefined,
      plain: undefined,
    },
  },
  "markdown-exit": {
    superior: {
      gfm: undefined,
      plain: undefined,
    },
    inferior: {
      gfm: undefined,
      plain: undefined,
    },
  },
};

function createMarkdownItRenderer(
  superior: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const md = gfm
    ? markdownIt({ html: false, linkify: true })
    : markdownIt("commonmark");
  if (superior) {
    md.use(markdownItCjkFriendlyPlugin);
  }
  return (source: string) => md.render(source);
}

function createMicromarkRenderer(
  superior: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const extensions = gfm
    ? superior
      ? extensionsWithGfm
      : extensionsWithGfmInferior
    : superior
      ? extensionsWithoutGfm
      : null;
  return (md: string) =>
    micromark(md, {
      extensions,
      htmlExtensions: gfm ? gfmHtmlExtensions : null,
    });
}

function createMarkdownExitRenderer(
  superior: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const md = gfm
    ? createMarkdownExit({ html: false, linkify: true })
    : createMarkdownExit("commonmark");
  if (superior) {
    // markdown-exit is compatible with markdown-it
    md.use(markdownItCjkFriendlyPlugin as unknown as MarkdownExitPluginSimple);
  }
  return (source: string) => md.render(source);
}

function createRenderer(
  engine: MarkdownProcessorName,
  superior: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  if (engine === "markdown-it") {
    return createMarkdownItRenderer(superior, gfm);
  }
  if (engine === "markdown-exit") {
    return createMarkdownExitRenderer(superior, gfm);
  }
  return createMicromarkRenderer(superior, gfm);
}

export function getRenderer(
  engine: MarkdownProcessorName | string,
  superior: boolean,
  gfm: boolean,
): MarkdownToHTMLRenderer {
  const normalizedEngine = normalizeMarkdownProcessorName(engine);
  const target: GfmPlainRendererSet = superior
    ? rendererStore[normalizedEngine].superior
    : rendererStore[normalizedEngine].inferior;
  if (gfm) {
    target.gfm ??= createRenderer(normalizedEngine, superior, true);
    return target.gfm;
  }
  target.plain ??= createRenderer(normalizedEngine, superior, false);
  return target.plain;
}

const versionedRendererCache = new Map<string, MarkdownToHTMLRenderer>();

export function createSuperiorRendererFromPlugins(
  engine: MarkdownProcessorName | string,
  isGfm: boolean,
  plugins: LoadedPlugins,
  version: string,
): MarkdownToHTMLRenderer {
  const normalizedEngine = normalizeMarkdownProcessorName(engine);
  const cacheKey = `${normalizedEngine}:${version}:${isGfm}`;
  const cached = versionedRendererCache.get(cacheKey);
  if (cached) return cached;

  let renderer: MarkdownToHTMLRenderer;

  if (
    (normalizedEngine === "markdown-it" || normalizedEngine === "markdown-exit") &&
    plugins.type === "markdown-it"
  ) {
    if (normalizedEngine === "markdown-exit") {
      const md = isGfm
        ? createMarkdownExit({ html: false, linkify: true })
        : createMarkdownExit("commonmark");
      md.use(plugins.plugin as unknown as MarkdownExitPluginSimple);
      renderer = (source: string) => md.render(source);
    } else {
      const md = isGfm
        ? markdownIt({ html: false, linkify: true })
        : markdownIt("commonmark");
      md.use(plugins.plugin);
      renderer = (source: string) => md.render(source);
    }
  } else if (normalizedEngine === "micromark" && plugins.type === "micromark") {
    const extensions = isGfm
      ? [
          plugins.cjkFriendlyExt,
          gfm(),
          ...(plugins.gfmStrikethroughCjkFriendlyExt
            ? [plugins.gfmStrikethroughCjkFriendlyExt()]
            : []),
        ]
      : [plugins.cjkFriendlyExt];
    renderer = (md: string) =>
      micromark(md, {
        extensions,
        htmlExtensions: isGfm ? gfmHtmlExtensions : null,
      });
  } else {
    // Fallback: use bundled renderer
    renderer = createRenderer(normalizedEngine, true, isGfm);
  }

  versionedRendererCache.set(cacheKey, renderer);
  return renderer;
}

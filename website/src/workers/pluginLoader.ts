import markdownItCjkFriendlyPlugin from "markdown-it-cjk-friendly";
import { cjkFriendlyExtension } from "micromark-extension-cjk-friendly";
import { gfmStrikethroughCjkFriendly } from "micromark-extension-cjk-friendly-gfm-strikethrough";

export type MarkdownEngineFamily = "micromark" | "markdown-it";

type MicromarkExtension = ReturnType<typeof cjkFriendlyExtension>;
type MarkdownItPlugin = typeof markdownItCjkFriendlyPlugin;

export type MarkdownItPlugins = {
  type: "markdown-it";
  plugin: MarkdownItPlugin;
};

export type MicromarkPlugins = {
  type: "micromark";
  cjkFriendlyExt: MicromarkExtension;
  gfmStrikethroughCjkFriendlyExt: (() => MicromarkExtension) | null;
};

export type LoadedPlugins = MarkdownItPlugins | MicromarkPlugins;

const moduleCache = new Map<string, unknown>();

function resolveExport(mod: unknown, key: string): unknown {
  if (mod && typeof mod === "object") {
    const record = mod as Record<string, unknown>;
    if (key in record) return record[key];
    const nestedDefault = record.default as Record<string, unknown> | undefined;
    if (nestedDefault && key in nestedDefault) return nestedDefault[key];
  }
  return undefined;
}

function resolveDefault(mod: unknown): unknown {
  if (mod && typeof mod === "object" && "default" in mod) {
    return (mod as { default?: unknown }).default;
  }
  return undefined;
}

function normalizeMarkdownItPlugin(mod: unknown): MarkdownItPlugin {
  const candidate = resolveDefault(mod) ?? mod;
  if (typeof candidate === "function") return candidate as MarkdownItPlugin;
  const nestedDefault = resolveDefault(candidate);
  if (typeof nestedDefault === "function") {
    return nestedDefault as MarkdownItPlugin;
  }
  throw new Error("Invalid markdown-it plugin module");
}

function normalizeMicromarkExtension(
  mod: unknown,
  exportName: string,
): (() => MicromarkExtension) | null {
  const candidate = resolveExport(mod, exportName);
  if (typeof candidate === "function") {
    return candidate as () => MicromarkExtension;
  }
  return null;
}

async function importFromEsmRun<T>(
  packageName: string,
  version: string,
): Promise<T> {
  const key = `${packageName}@${version}`;
  const cached = moduleCache.get(key);
  if (cached) return cached as T;
  const mod = await import(
    /* @vite-ignore */ `https://esm.run/${packageName}@${version}`
  );
  moduleCache.set(key, mod);
  return mod as T;
}

async function loadMarkdownItPlugin(
  version: string,
  bundledVersionName: string,
): Promise<MarkdownItPlugin> {
  if (version === bundledVersionName) {
    return markdownItCjkFriendlyPlugin;
  }
  const mod = await importFromEsmRun<unknown>(
    "markdown-it-cjk-friendly",
    version,
  );
  return normalizeMarkdownItPlugin(mod);
}

async function loadMicromarkPlugins(
  version: string,
  bundledVersionName: string,
): Promise<{
  cjkFriendlyExt: MicromarkExtension;
  gfmStrikethroughCjkFriendlyExt: (() => MicromarkExtension) | null;
}> {
  if (version === bundledVersionName) {
    return {
      cjkFriendlyExt: cjkFriendlyExtension(),
      gfmStrikethroughCjkFriendlyExt: gfmStrikethroughCjkFriendly,
    };
  }
  const [cjkMod, gfmStrikeMod] = await Promise.all([
    importFromEsmRun<unknown>("micromark-extension-cjk-friendly", version),
    importFromEsmRun<unknown>(
      "micromark-extension-cjk-friendly-gfm-strikethrough",
      version,
    ).catch(() => null),
  ]);
  const cjkFriendlyFactory = normalizeMicromarkExtension(
    cjkMod,
    "cjkFriendlyExtension",
  );
  if (!cjkFriendlyFactory) {
    throw new Error("Invalid micromark extension module");
  }
  const gfmStrikeFactory = gfmStrikeMod
    ? normalizeMicromarkExtension(gfmStrikeMod, "gfmStrikethroughCjkFriendly")
    : null;
  return {
    cjkFriendlyExt: cjkFriendlyFactory(),
    gfmStrikethroughCjkFriendlyExt: gfmStrikeFactory ?? null,
  };
}

export async function loadPlugins(
  engineFamily: MarkdownEngineFamily,
  version: string,
  bundledVersionName: string,
): Promise<LoadedPlugins> {
  if (engineFamily === "markdown-it") {
    const plugin = await loadMarkdownItPlugin(version, bundledVersionName);
    return { type: "markdown-it", plugin };
  }
  const { cjkFriendlyExt, gfmStrikethroughCjkFriendlyExt } =
    await loadMicromarkPlugins(version, bundledVersionName);
  return {
    type: "micromark",
    cjkFriendlyExt,
    gfmStrikethroughCjkFriendlyExt,
  };
}

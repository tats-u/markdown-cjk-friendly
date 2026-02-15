import { valid } from "semver";
import { runBench } from "./bench";
import type { MarkdownProcessorName } from "./markdownRenderer";
import { loadPlugins, type MarkdownEngineFamily } from "./pluginLoader";

export interface MarkdownBenchSettings {
  engine: MarkdownProcessorName;
  gfm: boolean;
  version: string;
  bundledVersionName: string;
}

self.addEventListener(
  "message",
  async (e: MessageEvent<[string, MarkdownBenchSettings]>) => {
    const [source, { gfm, engine, version, bundledVersionName }] = e.data;
    const sanitizedGfm = Boolean(gfm);
    if (version && version !== bundledVersionName && valid(version)) {
      const engineFamily: MarkdownEngineFamily =
        engine === "markdown-exit" ? "markdown-it" : engine;
      const plugins = await loadPlugins(
        engineFamily,
        version,
        bundledVersionName,
      );
      self.postMessage(
        await runBench(source, sanitizedGfm, engine, plugins, version),
      );
    } else {
      self.postMessage(await runBench(source, sanitizedGfm, engine));
    }
  },
);

export default {};

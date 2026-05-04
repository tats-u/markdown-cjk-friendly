import { type BenchResult, runBench } from "./bench";
import type { MarkdownProcessorName } from "./markdownRenderer";
import {
  getPluginErrorMessage,
  loadPlugins,
  type MarkdownEngineFamily,
  shouldLoadVersionedPlugins,
} from "./pluginLoader";

export interface MarkdownBenchSettings {
  engine: MarkdownProcessorName;
  gfm: boolean;
  version: string;
  bundledVersionName: string;
}

export type MarkdownBenchWorkerResult =
  | BenchResult
  | {
      success: false;
      error: string;
    };

self.addEventListener(
  "message",
  async (e: MessageEvent<[string, MarkdownBenchSettings]>) => {
    try {
      const [source, { gfm, engine, version, bundledVersionName }] = e.data;
      const sanitizedGfm = Boolean(gfm);
      if (shouldLoadVersionedPlugins(version, bundledVersionName)) {
        const engineFamily: MarkdownEngineFamily =
          engine === "markdown-exit" ? "markdown-it" : engine;
        const plugins = await loadPlugins(
          engineFamily,
          version,
          bundledVersionName,
        );
        self.postMessage(
          (await runBench(
            source,
            sanitizedGfm,
            engine,
            plugins,
            version,
          )) satisfies MarkdownBenchWorkerResult,
        );
        return;
      }
      self.postMessage(
        (await runBench(
          source,
          sanitizedGfm,
          engine,
        )) satisfies MarkdownBenchWorkerResult,
      );
    } catch (error) {
      self.postMessage({
        success: false,
        error: getPluginErrorMessage(error),
      } satisfies MarkdownBenchWorkerResult);
    }
  },
);

export default {};

import { runBench } from "./bench";
import type { MarkdownProcessorName } from "./markdownRenderer";

export interface MarkdownBenchSettings {
  engine: MarkdownProcessorName;
  gfm: boolean;
}

self.addEventListener(
  "message",
  async (e: MessageEvent<[string, MarkdownBenchSettings]>) => {
    const [source, { gfm, engine }] = e.data;
    self.postMessage(await runBench(source, gfm, engine));
  },
);

export default {};

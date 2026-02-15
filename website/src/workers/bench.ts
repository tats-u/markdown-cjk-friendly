import { Bench, type TaskResult } from "tinybench";
import {
  createSuperiorRendererFromPlugins,
  getRenderer,
  type MarkdownProcessorName,
} from "./markdownRenderer";
import type { LoadedPlugins } from "./pluginLoader";

export interface ResultPerOne {
  /**
   * samples mean/average (estimate of the population mean)
   */
  mean: number;
  /**
   * standard error of the mean
   */
  sem: number;
}

export type BenchResult = CompletedBenchResult | FailedBenchResult;

export interface FailedBenchResult {
  success: false;
  superior: TaskResult["state"];
  inferior: TaskResult["state"];
}

export interface CompletedBenchResult {
  success: true;
  superior: ResultPerOne;
  inferior: ResultPerOne;
}

export async function runBench(
  src: string,
  isGfm: boolean,
  engine: MarkdownProcessorName,
  plugins?: LoadedPlugins,
  version?: string,
): Promise<BenchResult> {
  const bench = new Bench();

  const superiorRenderer =
    plugins && version
      ? createSuperiorRendererFromPlugins(engine, isGfm, plugins, version)
      : getRenderer(engine, true, isGfm);
  const inferiorRenderer = getRenderer(engine, false, isGfm);

  bench.add("cjk-friendly", () => {
    superiorRenderer(src);
  });
  bench.add("no-cjk-friendly", () => {
    inferiorRenderer(src);
  });

  await bench.run();
  const resultsMap = new Map(
    Iterator.from(bench.tasks).map((t) => [t.name, t.result]),
  );
  // biome-ignore lint/style/noNonNullAssertion: key always exists
  const superiorResult = resultsMap.get("cjk-friendly")!;
  // biome-ignore lint/style/noNonNullAssertion: key always exists
  const inferiorResult = resultsMap.get("no-cjk-friendly")!;

  if (
    superiorResult.state !== "completed" ||
    inferiorResult.state !== "completed"
  ) {
    return {
      success: false,
      superior: superiorResult.state,
      inferior: inferiorResult.state,
    };
  }

  return {
    success: true,
    superior: {
      mean: superiorResult.latency.mean,
      sem: superiorResult.latency.sem,
    },
    inferior: {
      mean: inferiorResult.latency.mean,
      sem: inferiorResult.latency.sem,
    },
  };
}

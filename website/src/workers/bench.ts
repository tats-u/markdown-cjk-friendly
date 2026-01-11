import { Bench, type TaskResult } from "tinybench";
import { getRenderer, type MarkdownProcessorName } from "./markdownRenderer";

export interface ResultPerOne {
  mean: number;
  sd: number;
}

export type BenchResult = CompletedBenchResult | FailedBenchResult;

export interface FailedBenchResult {
  success: false;
  cjkFriendly: TaskResult["state"];
  noCjkFriendly: TaskResult["state"];
}

export interface CompletedBenchResult {
  success: true;
  cjkFriendly: ResultPerOne;
  noCjkFriendly: ResultPerOne;
}

export async function runBench(
  src: string,
  isGfm: boolean,
  engine: MarkdownProcessorName,
): Promise<BenchResult> {
  const bench = new Bench();

  const cjkFriendlyRenderer = getRenderer(engine, true, isGfm);
  const nonCJKFriendlyRenderer = getRenderer(engine, false, isGfm);

  bench.add("cjk-friendly", () => {
    cjkFriendlyRenderer(src);
  });
  bench.add("no-cjk-friendly", () => {
    nonCJKFriendlyRenderer(src);
  });

  await bench.run();
  const resultsMap = new Map(
    Iterator.from(bench.tasks).map((t) => [t.name, t.result]),
  );
  // biome-ignore lint/style/noNonNullAssertion: key always exists
  const cjkFriendlyResult = resultsMap.get("cjk-friendly")!;
  // biome-ignore lint/style/noNonNullAssertion: key always exists
  const noCjkFriendlyResult = resultsMap.get("no-cjk-friendly")!;

  if (
    cjkFriendlyResult.state !== "completed" ||
    noCjkFriendlyResult.state !== "completed"
  ) {
    return {
      success: false,
      cjkFriendly: cjkFriendlyResult.state,
      noCjkFriendly: noCjkFriendlyResult.state,
    };
  }

  return {
    success: true,
    cjkFriendly: {
      mean: cjkFriendlyResult.latency.mean,
      sd: cjkFriendlyResult.latency.sd,
    },
    noCjkFriendly: {
      mean: noCjkFriendlyResult.latency.mean,
      sd: noCjkFriendlyResult.latency.sd,
    },
  };
}

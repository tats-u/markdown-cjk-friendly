import { Bench } from "tinybench";
import { getRenderer, type MarkdownProcessorName } from "./markdownRenderer";

export interface ResultPerOne {
  mean: number;
  sd: number;
}

export interface BenchResult {
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
  const cjkFriendlyResult = resultsMap.get("cjk-friendly")!.latency;
  // biome-ignore lint/style/noNonNullAssertion: key always exists
  const noCjkFriendlyResult = resultsMap.get("no-cjk-friendly")!.latency;

  return {
    cjkFriendly: {
      mean: cjkFriendlyResult.mean,
      sd: cjkFriendlyResult.sd,
    },
    noCjkFriendly: {
      mean: noCjkFriendlyResult.mean,
      sd: noCjkFriendlyResult.sd,
    },
  };
}

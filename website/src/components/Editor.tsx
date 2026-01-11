import { OcMarkgithub2 } from "solid-icons/oc";
import {
  type Accessor,
  createMemo,
  createSignal,
  createUniqueId,
  onMount,
  Show,
} from "solid-js";
import type { BenchResult, ResultPerOne } from "../workers/bench";
import BenchmarkWorker from "../workers/benchmarker.worker?worker";
import { getRenderer } from "../workers/markdownRenderer";
import styles from "./Editor.module.css";

type MarkdownProcessorName = "micromark" | "markdown-it";

const [markdown, setMarkdown] = createSignal("");
const [gfmEnabled, setGfmEnabled] = createSignal(true);
const [engine, setEngine] = createSignal<MarkdownProcessorName>("micromark");
const [showSource, setShowSource] = createSignal(false);
const [cjkFriendlyTime, setCjkFriendlyTime] = createSignal<
  ResultPerOne | undefined
>(undefined);
const [nonCJKFriendlyTime, setNonCJKFriendlyTime] = createSignal<
  ResultPerOne | undefined
>(undefined);
const [cjkFriendlyBenchFailure, setCjkFriendlyBenchFailure] = createSignal<
  string | null
>(null);
const [nonCJKFriendlyBenchFailure, setNonCJKFriendlyBenchFailure] =
  createSignal<string | null>(null);
function resetBenchResult() {
  setCjkFriendlyTime(undefined);
  setNonCJKFriendlyTime(undefined);
}

const Editor = () => {
  const gfmCheckBoxId = createUniqueId();
  const [textareaMarkdown, setTextareaMarkdown] = createSignal("");
  const [isBenchmarking, setIsBenchmarking] = createSignal(false);

  const u8Encoder = new TextEncoder();

  let textareaRef: HTMLTextAreaElement | undefined;

  function handleCopyPermalink() {
    const markdown = textareaMarkdown();
    if (!markdown) return;
    const percentEncodedMarkdown = encodeURIComponent(markdown);
    const u8Buffer = u8Encoder.encode(markdown);
    let useU16 = false;
    let shortestB64Buffer = u8Buffer;
    if (u8Buffer.length >= markdown.length * 2) {
      const u16Buffer = Uint8Array.from(
        // Split a supplementary character into two surrogate code units on purpose
        Iterator.from(markdown.split("")).flatMap((char) => {
          // `char` is just an UTF-16 code unit, so use charAt instead of codePointAt
          const c = char.charCodeAt(0);
          // Little endian
          return [c & 255, c >> 8];
        }),
      );
      useU16 = true;
      shortestB64Buffer = u16Buffer;
    }
    // @ts-expect-error Not supported by Node.js
    const markdownBase64 = shortestB64Buffer.toBase64
      ? // @ts-expect-error Not supported by Node.js
        (shortestB64Buffer.toBase64({
          alphabet: "base64url",
          omitPadding: true,
        }) as string)
      : "";
    const url = new URL(window.location.href);
    if (
      // @ts-expect-error Not supported by Node.js
      !shortestB64Buffer.toBase64 ||
      percentEncodedMarkdown.length <= markdownBase64.length
    ) {
      url.searchParams.set("src", percentEncodedMarkdown);
      url.searchParams.delete("sc8");
      url.searchParams.delete("s16");
    } else if (useU16) {
      url.searchParams.set("s16", markdownBase64);
      url.searchParams.delete("sc8");
      url.searchParams.delete("src");
    } else {
      url.searchParams.set("sc8", markdownBase64);
      url.searchParams.delete("src");
      url.searchParams.delete("s16");
    }
    url.searchParams.set("gfm", Number(gfmEnabled()).toString());
    url.searchParams.set("engine", engine());
    window.history.replaceState(null, "", url.href);
    navigator.clipboard.writeText(window.location.href);
  }

  async function handleBenchmark() {
    try {
      setIsBenchmarking(true);
      setCjkFriendlyBenchFailure(null);
      setNonCJKFriendlyBenchFailure(null);
      setCjkFriendlyTime(undefined);
      setNonCJKFriendlyTime(undefined);
      const benchWorker = new BenchmarkWorker();
      const result = await (new Promise((resolve) => {
        benchWorker.postMessage([
          markdown(),
          {
            gfm: gfmEnabled(),
            engine: engine(),
          },
        ]);
        benchWorker.addEventListener("message", (e) => {
          resolve(e.data);
        });
      }) as Promise<BenchResult>);
      benchWorker.terminate();
      if (result.success) {
        setCjkFriendlyTime(result.cjkFriendly);
        setNonCJKFriendlyTime(result.noCjkFriendly);
      } else {
        setCjkFriendlyBenchFailure(
          result.cjkFriendly !== "completed" ? result.cjkFriendly : null,
        );
        setNonCJKFriendlyBenchFailure(
          result.noCjkFriendly !== "completed" ? result.noCjkFriendly : null,
        );
      }
    } finally {
      setIsBenchmarking(false);
    }
  }

  onMount(() => {
    const url = new URL(window.location.href);
    const src = url.searchParams.get("src");
    const b64u8 = url.searchParams.get("sc8");
    const b64u16 = url.searchParams.get("s16");
    const bench = url.searchParams.get("bench");
    if (src) {
      setMarkdown(decodeURIComponent(src));
      setTextareaMarkdown(decodeURIComponent(src));
    } else if (b64u8) {
      const decoded = new TextDecoder().decode(
        // @ts-expect-error Not supported by Node.js
        Uint8Array.fromBase64(b64u8, { alphabet: "base64url" }) as Uint8Array,
      );
      setMarkdown(decoded);
      setTextareaMarkdown(decoded);
    } else if (b64u16) {
      const decoded = new TextDecoder("utf-16le").decode(
        // @ts-expect-error Not supported by Node.js
        Uint8Array.fromBase64(b64u16, { alphabet: "base64url" }) as Uint8Array,
      );
      setMarkdown(decoded);
      setTextareaMarkdown(decoded);
    } else if (textareaRef) {
      setTextareaMarkdown(textareaRef.value);
      setMarkdown(textareaRef.value);
    }
    const gfm = url.searchParams.get("gfm");
    if (gfm) {
      const gfmLower = gfm.toLowerCase();
      switch (gfmLower) {
        case "false":
        case "off":
        case "no":
        case "f":
        case "n":
        case "0":
          setGfmEnabled(false);
          break;
        default:
          setGfmEnabled(true);
      }
    }
    const engine = url.searchParams.get("engine");
    if (engine) {
      const engineLower = engine.toLowerCase();
      switch (engineLower as MarkdownProcessorName) {
        case "markdown-it":
        case "micromark":
          setEngine(engineLower as MarkdownProcessorName);
          break;
      }
    }
    if (bench) {
      handleBenchmark();
    }
  });

  return (
    <div class={styles.editorAndPreviewWrapper}>
      <div class={styles.editorControlWrapper}>
        <div class={styles.controls}>
          <div>
            <label for={gfmCheckBoxId}>GFM</label>
            <input
              type="checkbox"
              id={gfmCheckBoxId}
              checked={gfmEnabled()}
              onInput={(e) => {
                setGfmEnabled(e.currentTarget.checked);
                resetBenchResult();
              }}
              disabled={isBenchmarking()}
            />
          </div>
          <select
            onChange={(e) => {
              setEngine(e.currentTarget.value as unknown as typeof engine);
              resetBenchResult();
            }}
            value={engine()}
            disabled={isBenchmarking()}
          >
            <option value="micromark">micromark</option>
            <option value="markdown-it">markdown-it</option>
          </select>
          <select
            onChange={(e) => {
              setShowSource(e.currentTarget.value === "source");
              resetBenchResult();
            }}
          >
            <option value="render">Render</option>
            <option value="source">Source</option>
          </select>
          <button type="button" onClick={handleCopyPermalink}>
            Copy permalink
          </button>
          <button
            type="button"
            onClick={handleBenchmark}
            disabled={isBenchmarking()}
          >
            Benchmark<Show when={isBenchmarking()}>ing…</Show>
          </button>
          <a
            class={styles.gitHubLink}
            href="https://github.com/tats-u/markdown-cjk-friendly"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            title="GitHub repository"
          >
            <OcMarkgithub2 />
          </a>
        </div>
        <textarea
          class={styles.editor}
          value={textareaMarkdown()}
          ref={textareaRef}
          // without `|| undefined`, converted from boolean to string and becomes always read-only
          readonly={isBenchmarking() || undefined}
          onInput={(e) => {
            setTextareaMarkdown(e.currentTarget.value);
            if (
              e.isComposing ||
              // Firefox only
              e.inputType === "insertCompositionText"
            )
              return;
            setMarkdown(e.currentTarget.value);
            resetBenchResult();
          }}
          onCompositionEnd={(e) => {
            setMarkdown(e.currentTarget.value);
            resetBenchResult();
          }}
        />
      </div>
      <Preview />
    </div>
  );
};

const MarkdownBody = ({ markdown }: { markdown: Accessor<string> }) => (
  <Show
    when={!showSource()}
    fallback={
      <pre class={styles.markdownSource}>
        <code>{markdown()}</code>
      </pre>
    }
  >
    <div class={styles.markdownBody} innerHTML={markdown()} />
  </Show>
);

function stripTrailingZeros(str: string) {
  return str.replace(/\.?0+$/, "");
}

function formatTime(ms: number) {
  if (ms >= 1000) {
    const sec = ms / 1000;
    return `${sec.toFixed(2)}s`;
  }
  if (ms === 0) {
    return "0ms";
  }
  if (ms < 1) {
    return `${stripTrailingZeros((ms * 1000).toFixed(1))}μs`;
  }
  return `${ms.toFixed(1)}ms`;
}

function ShowTime({ result }: { result: Accessor<ResultPerOne> }) {
  const { mean, sd } = result();
  return (
    <>
      (Time: {formatTime(mean)}±{formatTime(sd)})
    </>
  );
}

const Preview = () => {
  const cjkFriendlyHTML = createMemo(() => {
    const markdownValue = markdown();
    const gfmValue = gfmEnabled();
    const engineValue = engine();
    if (markdownValue === "") {
      return "";
    }
    const renderer = getRenderer(engineValue, true, gfmValue);
    const html = renderer(markdownValue);
    return html;
  });
  const nonCJKFriendlyHTML = createMemo(() => {
    const markdownValue = markdown();
    const gfmValue = gfmEnabled();
    const engineValue = engine();
    if (markdownValue === "") {
      return "";
    }
    const renderer = getRenderer(engineValue, false, gfmValue);

    const html = renderer(markdownValue);
    return html;
  });
  return (
    <div class={styles.resultContainer}>
      <p>Result:</p>
      <Show
        when={cjkFriendlyHTML() !== ""}
        fallback={<p>Converted HTML is displayed here.</p>}
      >
        <p>
          With this specification
          <Show
            when={cjkFriendlyBenchFailure() === null}
            fallback={` (bench ${cjkFriendlyBenchFailure()})`}
          >
            <Show when={cjkFriendlyTime() !== undefined}>
              {" "}
              {/** biome-ignore lint/style/noNonNullAssertion: when above */}
              <ShowTime result={() => cjkFriendlyTime()!} />
            </Show>
          </Show>
          :
        </p>
        <MarkdownBody markdown={() => cjkFriendlyHTML()} />
        <Show
          when={cjkFriendlyHTML() !== nonCJKFriendlyHTML()}
          fallback={
            <p>
              The output is identical even without this specification.
              <Show when={nonCJKFriendlyTime() !== undefined}>
                {" "}
                {/** biome-ignore lint/style/noNonNullAssertion: when above */}
                <ShowTime result={() => nonCJKFriendlyTime()!} />
              </Show>
            </p>
          }
        >
          <p>
            Without this specification
            <Show
              when={nonCJKFriendlyBenchFailure() === null}
              fallback={` (bench ${nonCJKFriendlyBenchFailure()})`}
            >
              <Show when={nonCJKFriendlyTime() !== undefined}>
                {" "}
                {/** biome-ignore lint/style/noNonNullAssertion: when above */}
                <ShowTime result={() => nonCJKFriendlyTime()!} />
              </Show>
            </Show>
            :
          </p>
          <MarkdownBody markdown={() => nonCJKFriendlyHTML()} />
        </Show>
      </Show>
    </div>
  );
};
export default Editor;

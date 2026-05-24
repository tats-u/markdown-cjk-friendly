import clsx from "clsx";
import { diffChars } from "diff";
import DOMPurify from "dompurify";
import { OcMarkgithub2 } from "solid-icons/oc";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  onMount,
  Show,
} from "solid-js";
import { visualDomDiff } from "visual-dom-diff";
import {
  usePlaygroundPluginQuery,
  usePlaygroundVersionList,
} from "../playground/queryLayer";
import type { ResultPerOne } from "../workers/bench";
import type { MarkdownBenchWorkerResult } from "../workers/benchmarker.worker";
import BenchmarkWorker from "../workers/benchmarker.worker?worker";
import {
  createSuperiorRendererFromPlugins,
  getRenderer,
  type MarkdownProcessorName,
} from "../workers/markdownRenderer";
import {
  getPluginErrorMessage,
  type MarkdownEngineFamily,
} from "../workers/pluginLoader";
import styles from "./Editor.module.css";

const [markdown, setMarkdown] = createSignal("");
const [gfmEnabled, setGfmEnabled] = createSignal(true);
const [engine, setEngine] = createSignal<MarkdownProcessorName>("micromark");
const [showSource, setShowSource] = createSignal(false);
const [showDiff, setShowDiff] = createSignal(false);
const [superiorTime, setSuperiorTime] = createSignal<ResultPerOne | undefined>(
  undefined,
);
const [inferiorTime, setInferiorTime] = createSignal<ResultPerOne | undefined>(
  undefined,
);
const [superiorBenchFailure, setSuperiorBenchFailure] = createSignal<
  string | null
>(null);
const [inferiorBenchFailure, setInferiorBenchFailure] = createSignal<
  string | null
>(null);
const [isBenchmarking, setIsBenchmarking] = createSignal(false);
const [libVersionSuperior, setLibVersionSuperior] = createSignal("");

function markdownEngineFamily(): MarkdownEngineFamily {
  const eg = engine();
  switch (eg) {
    case "markdown-exit":
      return "markdown-it";
  }
  return eg;
}

function resetBenchResult() {
  setSuperiorTime(undefined);
  setInferiorTime(undefined);
}

function getRenderErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to render preview";
}

type SuperiorPreviewState =
  | {
      kind: "placeholder";
    }
  | {
      kind: "loading";
      displayedHtml: string | undefined;
      isFetching: boolean;
    }
  | {
      kind: "ready";
      html: string;
      isFetching: boolean;
    }
  | {
      kind: "plugin-error";
      message: string;
    }
  | {
      kind: "render-error";
      message: string;
    };

function getRetainedPreviewHTML(previous: SuperiorPreviewState | undefined) {
  if (!previous) {
    return undefined;
  }
  switch (previous.kind) {
    case "loading":
      return previous.displayedHtml;
    case "ready":
      return previous.html;
    default:
      return undefined;
  }
}

const Editor = (props: { bundledVersionName: string }) => {
  const gfmCheckBoxId = createUniqueId();
  const [textareaMarkdown, setTextareaMarkdown] = createSignal("");
  const versionList = usePlaygroundVersionList(
    () => markdownEngineFamily(),
    () => props.bundledVersionName,
  );

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
    const markdownBase64 = shortestB64Buffer.toBase64
      ? shortestB64Buffer.toBase64({
          alphabet: "base64url",
          omitPadding: true,
        })
      : "";
    const url = new URL(window.location.href);
    if (
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
    const ver = libVersionSuperior();
    if (ver && ver !== props.bundledVersionName) {
      url.searchParams.set("ver", ver);
    } else {
      url.searchParams.delete("ver");
    }
    window.history.replaceState(null, "", url.href);
    navigator.clipboard.writeText(window.location.href);
  }

  async function handleBenchmark() {
    let benchWorker: Worker | undefined;
    try {
      setIsBenchmarking(true);
      setSuperiorBenchFailure(null);
      setInferiorBenchFailure(null);
      setSuperiorTime(undefined);
      setInferiorTime(undefined);
      benchWorker = new BenchmarkWorker();
      const result = await new Promise<MarkdownBenchWorkerResult>(
        (resolve, reject) => {
          const handleMessage = (
            e: MessageEvent<MarkdownBenchWorkerResult>,
          ) => {
            cleanup();
            resolve(e.data);
          };
          const handleError = (e: ErrorEvent) => {
            cleanup();
            reject(
              e.error ?? new Error(e.message || "Benchmark worker failed"),
            );
          };
          const cleanup = () => {
            benchWorker?.removeEventListener("message", handleMessage);
            benchWorker?.removeEventListener("error", handleError);
          };
          benchWorker?.addEventListener("message", handleMessage);
          benchWorker?.addEventListener("error", handleError);
          benchWorker?.postMessage([
            markdown(),
            {
              gfm: gfmEnabled(),
              engine: engine(),
              version: libVersionSuperior(),
              bundledVersionName: props.bundledVersionName,
            },
          ]);
        },
      );
      if (result.success) {
        setSuperiorTime(result.superior);
        setInferiorTime(result.inferior);
      } else if ("error" in result) {
        setSuperiorBenchFailure(result.error);
        setInferiorBenchFailure(result.error);
      } else {
        setSuperiorBenchFailure(
          result.superior !== "completed" ? result.superior : null,
        );
        setInferiorBenchFailure(
          result.inferior !== "completed" ? result.inferior : null,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Benchmark worker failed";
      setSuperiorBenchFailure(message);
      setInferiorBenchFailure(message);
    } finally {
      benchWorker?.terminate();
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
        Uint8Array.fromBase64(b64u8, { alphabet: "base64url" }),
      );
      setMarkdown(decoded);
      setTextareaMarkdown(decoded);
    } else if (b64u16) {
      const decoded = new TextDecoder("utf-16le").decode(
        Uint8Array.fromBase64(b64u16, { alphabet: "base64url" }),
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
        case "marked":
        case "markdown-it":
        case "micromark":
        case "markdown-exit":
          setEngine(engineLower as MarkdownProcessorName);
          break;
      }
    }
    const ver = url.searchParams.get("ver");
    if (ver) {
      setLibVersionSuperior(ver);
    }
    if (bench) {
      handleBenchmark();
    }
  });
  createEffect(() => {
    if (versionList.isPending()) {
      return;
    }
    const preferredVersion = versionList.preferredVersion();
    setLibVersionSuperior((value) =>
      value === props.bundledVersionName
        ? props.bundledVersionName
        : preferredVersion,
    );
  });
  const isSelectedVersionReady = createMemo(() => {
    const version = libVersionSuperior();
    if (version === "") {
      return false;
    }
    if (version === props.bundledVersionName) {
      return true;
    }
    if (versionList.isPending()) {
      return false;
    }
    return versionList.candidates().includes(version);
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
            <option value="markdown-exit">markdown-exit</option>
            <option value="marked">marked</option>
          </select>
          <select
            onChange={(e) => {
              setLibVersionSuperior(e.currentTarget.value);
              resetBenchResult();
            }}
            value={libVersionSuperior()}
            disabled={isBenchmarking() || versionList.candidates().length <= 1}
          >
            <Show
              when={versionList.candidates().length > 0}
              fallback={<option value={""}>Loading…</option>}
            >
              <For each={versionList.candidates()}>
                {(version) => <option value={version}>{version}</option>}
              </For>
            </Show>
          </select>
          <button type="button" onClick={handleCopyPermalink}>
            Copy permalink
          </button>
          <button
            type="button"
            onClick={handleBenchmark}
            disabled={isBenchmarking() || textareaMarkdown() === ""}
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
      <Preview
        bundledVersionName={props.bundledVersionName}
        isSelectedVersionReady={isSelectedVersionReady}
      />
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
    {/* TODO: Prefer Element.setHTML() over innerHTML + DOMPurify once support is broad enough, including Safari. */}
    <div
      class={styles.markdownBody}
      innerHTML={sanitizeRenderedHtml(markdown())}
    />
  </Show>
);

function sanitizeRenderedHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "a",
      "blockquote",
      "br",
      "code",
      "del",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "img",
      "input",
      "li",
      "ol",
      "p",
      "pre",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "ul",
    ],
    ALLOWED_ATTR: [
      "align",
      "alt",
      "checked",
      "class",
      "disabled",
      "href",
      "src",
      "start",
      "title",
      "type",
    ],
  });
}

const MarkdownDiff = (props: {
  superior: Accessor<string>;
  inferior: Accessor<string>;
  superiorTime: Accessor<ResultPerOne | undefined>;
  inferiorTime: Accessor<ResultPerOne | undefined>;
}) => {
  let containerRef: HTMLDivElement | undefined;
  const diff = createMemo(() => {
    const templateSuperior = document.createElement("template");
    templateSuperior.innerHTML = sanitizeRenderedHtml(props.superior());
    const templateInferior = document.createElement("template");
    templateInferior.innerHTML = sanitizeRenderedHtml(props.inferior());

    return visualDomDiff(templateInferior.content, templateSuperior.content);
  });
  createEffect(() => {
    if (containerRef) {
      containerRef.innerHTML = "";
      containerRef.appendChild(diff());
    }
  });

  return (
    <>
      <p>
        <Show when={props.superior() !== props.inferior()} fallback="Exact:">
          <span class={styles.legendAdded}>Added</span> /{" "}
          <span class={styles.legendModified}>Modified</span> /{" "}
          <span class={styles.legendRemoved}>Removed</span> by this
          specification:
        </Show>
        <Show when={superiorTime() || inferiorTime()}>
          <br />
          <Show when={superiorTime()}>
            {/** biome-ignore lint/style/noNonNullAssertion: guarded by left */}
            with spec: {formatMeanAndSEM(superiorTime()!)}
          </Show>
          <Show when={superiorTime() && inferiorTime()}>{" / "}</Show>
          <Show when={inferiorTime()}>
            without spec:{" "}
            {
              // biome-ignore lint/style/noNonNullAssertion: guarded by left
              formatMeanAndSEM(inferiorTime()!)
            }
          </Show>
        </Show>
      </p>
      <div
        class={clsx(styles.markdownBody, styles.markdownDiff)}
        ref={containerRef}
      />
    </>
  );
};

const MarkdownSourceDiff = (props: {
  superior: Accessor<string>;
  inferior: Accessor<string>;
  superiorTime: Accessor<ResultPerOne | undefined>;
  inferiorTime: Accessor<ResultPerOne | undefined>;
}) => {
  const diff = createMemo(() => {
    const diff = diffChars(props.inferior(), props.superior());
    return diff.map((part) => {
      if (part.added) {
        return <ins>{part.value}</ins>;
      }
      if (part.removed) {
        return <del>{part.value}</del>;
      }
      return part.value;
    });
  });

  return (
    <>
      <p>
        <Show when={props.superior() !== props.inferior()} fallback="Exact:">
          <span class={styles.legendAdded}>Added</span> /{" "}
          <span class={styles.legendRemoved}>Removed</span> by this
          specification:
        </Show>
        <Show when={superiorTime() || inferiorTime()}>
          <br />
          <Show when={superiorTime()}>
            {/** biome-ignore lint/style/noNonNullAssertion: guarded by left */}
            with spec: {formatMeanAndSEM(superiorTime()!)}
          </Show>
          <Show when={superiorTime() && inferiorTime()}>{", "}</Show>
          <Show when={inferiorTime()}>
            without spec:{" "}
            {
              // biome-ignore lint/style/noNonNullAssertion: guarded by left
              formatMeanAndSEM(inferiorTime()!)
            }
          </Show>
        </Show>
      </p>
      <pre class={clsx(styles.markdownSource, styles.markdownSourceDiff)}>
        <code>{diff()}</code>
      </pre>
    </>
  );
};

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
  return <>(Time: {formatMeanAndSEM(result())})</>;
}

function formatMeanAndSEM(result: ResultPerOne) {
  return `${formatTime(result.mean)}±${formatTime(result.sem)}`;
}

const Preview = (props: {
  bundledVersionName: string;
  isSelectedVersionReady: Accessor<boolean>;
}) => {
  const diffCheckBoxId = createUniqueId();
  const pluginsQuery = usePlaygroundPluginQuery(
    () => markdownEngineFamily(),
    () => libVersionSuperior(),
    () => props.bundledVersionName,
    () => props.isSelectedVersionReady(),
  );

  const superiorPreview = createMemo(
    (previous?: SuperiorPreviewState): SuperiorPreviewState => {
      const retainedHtml = getRetainedPreviewHTML(previous);
      const markdownValue = markdown();
      if (markdownValue === "") {
        return { kind: "placeholder" };
      }
      const gfmValue = gfmEnabled();
      const engineValue = engine();
      const version = libVersionSuperior();
      if (!version) {
        return {
          kind: "loading",
          displayedHtml: retainedHtml,
          isFetching: false,
        };
      }
      if (version === props.bundledVersionName) {
        try {
          const renderer = getRenderer(engineValue, true, gfmValue);
          return {
            kind: "ready",
            html: renderer(markdownValue),
            isFetching: false,
          };
        } catch (error) {
          return {
            kind: "render-error",
            message: getRenderErrorMessage(error),
          };
        }
      }
      if (pluginsQuery.error) {
        return {
          kind: "plugin-error",
          message: getPluginErrorMessage(pluginsQuery.error),
        };
      }
      const loadedPlugins = pluginsQuery.data;
      if (!loadedPlugins) {
        return {
          kind: "loading",
          displayedHtml: retainedHtml,
          isFetching: pluginsQuery.isFetching,
        };
      }
      try {
        const renderer = createSuperiorRendererFromPlugins(
          engineValue,
          gfmValue,
          loadedPlugins,
          version,
        );
        return {
          kind: "ready",
          html: renderer(markdownValue),
          isFetching: pluginsQuery.isFetching,
        };
      } catch (error) {
        return {
          kind: "render-error",
          message: getRenderErrorMessage(error),
        };
      }
    },
  );
  const superiorHTML = createMemo(() => {
    const preview = superiorPreview();
    switch (preview.kind) {
      case "placeholder":
        return "";
      case "loading":
        return preview.displayedHtml;
      case "ready":
        return preview.html;
      default:
        return undefined;
    }
  });
  const pluginErrorMessage = createMemo(() => {
    const preview = superiorPreview();
    return preview.kind === "plugin-error" ? preview.message : null;
  });
  const renderErrorMessage = createMemo(() => {
    const preview = superiorPreview();
    return preview.kind === "render-error" ? preview.message : null;
  });
  const isPreviewFetching = createMemo(() => {
    const preview = superiorPreview();
    switch (preview.kind) {
      case "loading":
        return preview.displayedHtml !== undefined;
      case "ready":
        return preview.isFetching;
      default:
        return false;
    }
  });
  const inferiorHTML = createMemo(() => {
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
    <div
      class={styles.resultContainer}
      classList={{ [styles.resultContainerFetching]: isPreviewFetching() }}
    >
      <div class={styles.controls}>
        <div>Result:</div>
        <select
          onChange={(e) => {
            setShowSource(e.currentTarget.value === "source");
          }}
        >
          <option value="render">Render</option>
          <option value="source">Source</option>
        </select>
        <div>
          <label for={diffCheckBoxId}>Diff</label>
          <input
            type="checkbox"
            checked={showDiff()}
            onChange={(e) => setShowDiff(e.currentTarget.checked)}
            disabled={isBenchmarking()}
            id={diffCheckBoxId}
          />
        </div>
      </div>
      <Show when={isPreviewFetching()}>
        <div class={styles.updatingOverlay}>Updating plugin…</div>
      </Show>
      <Show
        when={pluginErrorMessage() === null}
        fallback={<p>Error loading plugin: {pluginErrorMessage()}</p>}
      >
        <Show
          when={renderErrorMessage() === null}
          fallback={<p>Error rendering preview: {renderErrorMessage()}</p>}
        >
          <Show
            when={superiorHTML() !== undefined}
            fallback={
              <Show
                when={markdown() !== ""}
                fallback={<p>Converted HTML is displayed here.</p>}
              >
                <p>Loading plugin…</p>
              </Show>
            }
          >
            <Show
              when={superiorHTML() !== ""}
              fallback={<p>Converted HTML is displayed here.</p>}
            >
              <Show
                when={!showDiff()}
                fallback={
                  <Show
                    when={!showSource()}
                    fallback={
                      <MarkdownSourceDiff
                        superior={() => superiorHTML() as string}
                        inferior={() => inferiorHTML()}
                        superiorTime={superiorTime}
                        inferiorTime={inferiorTime}
                      />
                    }
                  >
                    <MarkdownDiff
                      superior={() => superiorHTML() as string}
                      inferior={() => inferiorHTML()}
                      superiorTime={superiorTime}
                      inferiorTime={inferiorTime}
                    />
                  </Show>
                }
              >
                <p>
                  With this specification
                  <Show
                    when={superiorBenchFailure() === null}
                    fallback={` (bench ${superiorBenchFailure()})`}
                  >
                    <Show when={superiorTime() !== undefined}>
                      {" "}
                      {/** biome-ignore lint/style/noNonNullAssertion: when above */}
                      <ShowTime result={() => superiorTime()!} />
                    </Show>
                  </Show>
                  :
                </p>
                <MarkdownBody markdown={() => superiorHTML() as string} />
                <Show
                  when={superiorHTML() !== inferiorHTML()}
                  fallback={
                    <p>
                      The output is identical even without this specification.
                      <Show when={inferiorTime() !== undefined}>
                        {" "}
                        {/** biome-ignore lint/style/noNonNullAssertion: when above */}
                        <ShowTime result={() => inferiorTime()!} />
                      </Show>
                    </p>
                  }
                >
                  <p>
                    Without this specification
                    <Show
                      when={inferiorBenchFailure() === null}
                      fallback={` (bench ${inferiorBenchFailure()})`}
                    >
                      <Show when={inferiorTime() !== undefined}>
                        {" "}
                        {/** biome-ignore lint/style/noNonNullAssertion: when above */}
                        <ShowTime result={() => inferiorTime()!} />
                      </Show>
                    </Show>
                    :
                  </p>
                  <MarkdownBody markdown={() => inferiorHTML()} />
                </Show>
              </Show>
            </Show>
          </Show>
        </Show>
      </Show>
    </div>
  );
};
export default Editor;

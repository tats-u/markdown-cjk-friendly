import { getRenderer, type MarkdownProcessorName } from "./markdownRenderer";

export interface MarkdownConvertSettings {
  engine: MarkdownProcessorName;
  gfm: boolean;
  cjkFriendly: boolean;
}

export type MarkdownConvertResult =
  | {
      success: true;
      html: string;
    }
  | {
      success: false;
      error: unknown;
    };

function convert(
  source: string,
  cjkFriendly: boolean,
  gfm: boolean,
  engine: MarkdownProcessorName,
): void {
  const renderer = getRenderer(engine, cjkFriendly, gfm);
  self.postMessage({
    success: true,
    html: renderer(source),
  } as MarkdownConvertResult);
}

self.addEventListener(
  "message",
  async (e: MessageEvent<[string, MarkdownConvertSettings]>) => {
    try {
      const [source, { cjkFriendly, gfm, engine }] = e.data;
      convert(source, cjkFriendly, gfm, engine);
    } catch (err) {
      self.postMessage({ success: false, error: err } as MarkdownConvertResult);
    }
  },
);

export default {};

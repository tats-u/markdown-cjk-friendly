import { getRenderer, type MarkdownProcessorName } from "./markdownRenderer";

export interface MarkdownConvertSettings {
  engine: MarkdownProcessorName;
  gfm: boolean;
  cjkFriendly: boolean;
}

export type MarkdownConvertResult = { src: string } & (
  | {
      success: true;
      html: string;
    }
  | {
      success: false;
      error: unknown;
    }
);

function convert(
  source: string,
  cjkFriendly: boolean,
  gfm: boolean,
  engine: MarkdownProcessorName,
): void {
  const renderer = getRenderer(engine, cjkFriendly, gfm);
  self.postMessage({
    src: source,
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
      self.postMessage({
        src: e.data[0],
        success: false,
        error: err,
      } as MarkdownConvertResult);
    }
  },
);

export default {};

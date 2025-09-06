import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src"],
  format: "esm",
  platform: "neutral",
  splitting: false,
  dts: true,
  target: "es2021",
});

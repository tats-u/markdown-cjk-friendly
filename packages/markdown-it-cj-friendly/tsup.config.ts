import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src"],
  format: ["esm", "cjs"],
  platform: "neutral",
  splitting: false,
  dts: true,
  target: "es2024",
});

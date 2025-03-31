import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/**"],
  platform: "neutral",
  format: "esm",
  // splitting: false,
  dts: true,
  target: "es2021",
  outputOptions: {
    inlineDynamicImports: true,
  },
  unbundle: true,
});

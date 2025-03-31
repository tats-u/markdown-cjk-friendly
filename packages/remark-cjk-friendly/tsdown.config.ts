import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/**"],
  format: "esm",
  platform: "neutral",
  // splitting: false,
  dts: true,
  target: "es2021",
  outputOptions: {
    inlineDynamicImports: true,
  },
  unbundle: true,
});

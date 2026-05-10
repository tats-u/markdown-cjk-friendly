import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/**"],
  platform: "neutral",
  format: "esm",
  dts: true,
  target: "es2022",
  unbundle: true,
});

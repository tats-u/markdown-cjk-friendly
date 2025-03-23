import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src"],
  format: "esm",
  splitting: false,
  dts: true,
  target: "es2021",
});

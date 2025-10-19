import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: "esm",
      syntax: "es2022",
      dts: true,
      bundle: false,
    },
    {
      format: "cjs",
      syntax: "es2022",
    },
  ],
});

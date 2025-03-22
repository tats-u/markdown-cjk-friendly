import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: "esm",
      syntax: "es2024",
      dts: true,
      bundle: false,
      externalHelpers: false,
    },
  ],
});

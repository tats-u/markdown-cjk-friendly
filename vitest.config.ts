import codspeedPlugin from "@codspeed/vitest-plugin";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vitest"],
      dts: true, // generate TypeScript declaration
    }),
    codspeedPlugin(),
  ],
  test: {
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});

import commonjs from "@rollup/plugin-commonjs";
import { builtinModules } from "module";
import path from "node:path";
import modify from "rollup-plugin-modify";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    reportCompressedSize: true,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      fileName: "main",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [...builtinModules, "paperlib"],
      output: {
        format: "cjs",
      },
    },
    outDir: "./dist",
    emptyOutDir: true,
  },

  esbuild: {
    keepNames: true,
  },

  resolve: {
    alias: {
      "@": path.join(__dirname, "src") + "/",
    },
  },

  plugins: [
    commonjs(),
    modify({
      find: /import.*from "paperlib";?/,
      // find: /import { PLAPI } from "paperlib";/,
      replace: (match, path) => "",
    }),
  ],
});

import renderer from "@future-scholars/vite-plugin-electron-renderer";
import commonjs from "@rollup/plugin-commonjs";
import vue from "@vitejs/plugin-vue";
import { builtinModules } from "module";
import path from "node:path";
import modify from "rollup-plugin-modify";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    minify: false,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
      },
      external: [...builtinModules, "paperlib"],
    },
    outDir: "./dist/",
    target: "es2022",
    emptyOutDir: false,
  },
  publicDir: "./view/public/",

  esbuild: {
    keepNames: true,
  },

  resolve: {
    alias: {
      "@": path.join(__dirname, "src") + "/",
    },
  },

  plugins: [
    vue(),
    commonjs(),
    renderer(),
    modify({
      find: /import.*from "paperlib";?/,
      // find: /import { PLAPI } from "paperlib";/,
      replace: (match, path) => "",
    }),
  ],
});

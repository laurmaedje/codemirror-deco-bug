import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  server: {
    port: 7777,
    hmr: {
      port: 7777,
    },
  },
});

import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@diffopotamus/react": resolve(__dirname, "../src"),
      "@diffopotamus/core": resolve(__dirname, "../../core/src"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

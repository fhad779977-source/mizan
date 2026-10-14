// Multi-page Vite app for the web section. Each site / tool is its own HTML
// entry so they never share runtime state:
//   /            web index        /form/      FORM — Independent Digital Atelier
//   /lab/        interaction lab  /concepts/  concept screens (capture source)
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

const r = (p: string) => resolve(import.meta.dirname, p);

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, host: "127.0.0.1" },
  preview: { port: 4173, strictPort: true, host: "127.0.0.1" },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: r("index.html"),
        form: r("form/index.html"),
        lab: r("lab/index.html"),
        concepts: r("concepts/index.html"),
      },
    },
  },
});

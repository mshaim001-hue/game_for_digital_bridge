import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    hmr: false,
    ws: false,
  },
  build: {
    target: "es2020",
    sourcemap: true,
  },
  plugins: [
    {
      name: "no-vite-client",
      enforce: "post",
      transformIndexHtml(html) {
        return html.replace(
          /<script type="module"[^>]*src="\/@vite\/client"><\/script>/g,
          ""
        );
      },
    },
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Допрос — Кошмар инспектора",
        short_name: "Допрос",
        description: "Интерактивный допрос Digital Bridge: нужна ли декларация",
        theme_color: "#0c0a0f",
        background_color: "#0c0a0f",
        display: "fullscreen",
        orientation: "portrait",
        start_url: "./",
        icons: [
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
        navigateFallback: "index.html",
      },
    }),
  ],
});

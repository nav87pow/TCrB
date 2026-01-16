import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    // PWA (Manifest + Service Worker) for "Install app" / Add to Home Screen
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["tcrbFicon.png"],
      manifest: {
        name: "T CrB Nova Tracker",
        short_name: "TCrB",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/tcrbFicon.png",
            sizes: "1024x1024",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      "/api": "http://localhost:5050",
    },
  },
});

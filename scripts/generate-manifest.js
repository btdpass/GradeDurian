const fs = require("fs");
const path = require("path");
const { basePath } = require("../site.config");

const manifest = {
  display: "standalone",
  scope: `${basePath}/`,
  start_url: `${basePath}/login/`,
  name: "Grade Durian",
  short_name: "Grade Durian",
  description: "A third-party app that lets students view and calculate their grades using Synergy SIS.",
  theme_color: "#000000",
  icons: [
    { src: `${basePath}/assets/icon-192x192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
    { src: `${basePath}/assets/icon-256x256.png`, sizes: "256x256", type: "image/png", purpose: "any" },
    { src: `${basePath}/assets/icon-384x384.png`, sizes: "384x384", type: "image/png", purpose: "any" },
    { src: `${basePath}/assets/icon-512x512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    { src: `${basePath}/assets/mask_icon-192x192.png`, sizes: "192x192", type: "image/png", purpose: "maskable" },
    { src: `${basePath}/assets/mask_icon-256x256.png`, sizes: "256x256", type: "image/png", purpose: "maskable" },
    { src: `${basePath}/assets/mask_icon-384x384.png`, sizes: "384x384", type: "image/png", purpose: "maskable" },
    { src: `${basePath}/assets/mask_icon-512x512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

fs.writeFileSync(
  path.join(__dirname, "../public/manifest.json"),
  JSON.stringify(manifest, null, "\t")
);

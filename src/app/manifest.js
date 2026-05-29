export default function manifest() {
  return {
    name: "TuttoEvento",
    short_name: "TuttoEvento",
    description:
      "Dashboard operativa per booking, artisti, eventi e chat TuttoEvento.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f5f5f6",
    theme_color: "#111111",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
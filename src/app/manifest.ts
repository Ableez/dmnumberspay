import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Numberspay",
    short_name: "Numberspay",
    description: "A Progressive Web App built with Next.js",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/icons/152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/icons/192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/256.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/icons/512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/1024.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}

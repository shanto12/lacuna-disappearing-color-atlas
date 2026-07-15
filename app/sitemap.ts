import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://lacuna-disappearing-color-atlas.netlify.app",
      lastModified: new Date("2026-07-15T00:00:00-05:00"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

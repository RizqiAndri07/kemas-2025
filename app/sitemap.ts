import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.kemasprasasti.com",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/about",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/competition/tryout",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/competition/futsal",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/competition/prasasti_festival",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/competition/adc",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/competition/mlbb",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/competition",
      lastModified: new Date(),
    },
    {
      url: "https://www.kemasprasasti.com/contact",
      lastModified: new Date(),
    },
  ];
}

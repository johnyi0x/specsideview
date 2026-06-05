import { listComparisonSlugs } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export default async function sitemap() {
  const base = siteUrl();
  const staticRoutes = ["", "/about", "/compare"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let compareRoutes: { url: string; lastModified: Date; changeFrequency: "weekly"; priority: number }[] = [];
  try {
    const slugs = await listComparisonSlugs();
    compareRoutes = slugs.map((slug) => ({
      url: `${base}/compare/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch {
    // Database not configured locally — ship static routes only.
  }

  return [...staticRoutes, ...compareRoutes];
}

import { listCategories, listAllProductSlugs } from "@/lib/data";
import { defaultLocale, localizedPath } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = siteUrl();
  const locale = defaultLocale;

  const staticRoutes = ["", "/about", "/contact", "/privacy", "/compare"].map((path) => ({
    url: `${base}${localizedPath(path, locale)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let categoryRoutes: typeof staticRoutes = [];
  let productRoutes: typeof staticRoutes = [];

  try {
    const cats = await listCategories();
    categoryRoutes = cats.map((c) => ({
      url: `${base}${localizedPath(`/compare/category/${c.slug}`, locale)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const slugs = await listAllProductSlugs();
    productRoutes = slugs.map(({ slug, categorySlug }) => ({
      url: `${base}${localizedPath(`/compare/category/${categorySlug}?a=${encodeURIComponent(slug)}`, locale)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch {
    // Database not configured locally — ship static routes only.
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

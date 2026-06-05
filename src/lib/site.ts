export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://specsideview.com";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

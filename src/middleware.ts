import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { comparePairPath } from "@/lib/compare-url";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

/** /{locale}/compare/{slugA}/{slugB} → /{locale}/compare/{slugA}-vs-{slugB} */
function redirectLegacyTwoSegmentCompare(pathname: string, request: NextRequest): NextResponse | null {
  const match = pathname.match(/^\/([^/]+)\/compare\/([^/]+)\/([^/]+)$/);
  if (!match) return null;

  const [, locale, slugA, slugB] = match;
  if (!isLocale(locale)) return null;

  const url = request.nextUrl.clone();
  url.pathname = comparePairPath(slugA, slugB, locale as Locale);
  return NextResponse.redirect(url, 308);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    /\.(ico|svg|png|jpg|jpeg|webp|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segment = pathname.split("/")[1];

  if (segment && isLocale(segment)) {
    const legacyCompare = redirectLegacyTwoSegmentCompare(pathname, request);
    if (legacyCompare) return legacyCompare;
    return NextResponse.next();
  }

  // /compare/a/b (no locale) → /en/compare/a-vs-b in one hop
  const bareCompare = pathname.match(/^\/compare\/([^/]+)\/([^/]+)$/);
  if (bareCompare) {
    const [, slugA, slugB] = bareCompare;
    const url = request.nextUrl.clone();
    url.pathname = comparePairPath(slugA, slugB, defaultLocale);
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

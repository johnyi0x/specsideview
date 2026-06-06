import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { comparePairPath } from "@/lib/compare-url";
import { defaultLocale, isLocale, localizedPath, type Locale } from "@/lib/i18n";

const RESERVED_COMPARE_SEGMENTS = new Set(["category", "browse"]);

/** /{locale}/compare/category-vs-laptops → /{locale}/compare/category/laptops (bad legacy redirect) */
function redirectMistakenCategoryPair(pathname: string, request: NextRequest): NextResponse | null {
  const match = pathname.match(/^\/([^/]+)\/compare\/category-vs-([^/]+)$/);
  if (!match) return null;

  const [, locale, categorySlug] = match;
  if (!isLocale(locale)) return null;

  const url = request.nextUrl.clone();
  url.pathname = localizedPath(`/compare/category/${categorySlug}`, locale as Locale);
  return NextResponse.redirect(url, 308);
}

/** /{locale}/compare/{slugA}/{slugB} → /{locale}/compare/{slugA}-vs-{slugB} */
function redirectLegacyTwoSegmentCompare(pathname: string, request: NextRequest): NextResponse | null {
  const match = pathname.match(/^\/([^/]+)\/compare\/([^/]+)\/([^/]+)$/);
  if (!match) return null;

  const [, locale, slugA, slugB] = match;
  if (!isLocale(locale)) return null;
  if (RESERVED_COMPARE_SEGMENTS.has(slugA)) return null;

  const url = request.nextUrl.clone();
  url.pathname = comparePairPath(slugA, slugB, locale as Locale);
  return NextResponse.redirect(url, 308);
}

/** /{locale}/compare/laptops → /{locale}/compare/category/laptops */
function redirectBareCategorySlug(pathname: string, request: NextRequest): NextResponse | null {
  const match = pathname.match(/^\/([^/]+)\/compare\/([^/]+)$/);
  if (!match) return null;

  const [, locale, segment] = match;
  if (!isLocale(locale)) return null;
  if (RESERVED_COMPARE_SEGMENTS.has(segment)) return null;
  if (segment.includes("-vs-")) return null;

  const url = request.nextUrl.clone();
  url.pathname = localizedPath(`/compare/category/${segment}`, locale as Locale);
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
    const mistakenCategory = redirectMistakenCategoryPair(pathname, request);
    if (mistakenCategory) return mistakenCategory;
    const legacyCompare = redirectLegacyTwoSegmentCompare(pathname, request);
    if (legacyCompare) return legacyCompare;
    const bareCategory = redirectBareCategorySlug(pathname, request);
    if (bareCategory) return bareCategory;
    return NextResponse.next();
  }

  // /compare/category/laptops (no locale) → /en/compare/category/laptops
  const bareCategoryList = pathname.match(/^\/compare\/category\/([^/]+)$/);
  if (bareCategoryList) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(`/compare/category/${bareCategoryList[1]}`, defaultLocale);
    return NextResponse.redirect(url, 308);
  }

  // /compare/laptops (no locale) → /en/compare/category/laptops
  const bareCategoryNoLocale = pathname.match(/^\/compare\/([^/]+)$/);
  if (bareCategoryNoLocale) {
    const segment = bareCategoryNoLocale[1];
    if (!RESERVED_COMPARE_SEGMENTS.has(segment) && !segment.includes("-vs-")) {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(`/compare/category/${segment}`, defaultLocale);
      return NextResponse.redirect(url, 308);
    }
  }

  // /compare/a/b (no locale) → /en/compare/a-vs-b — skip category/browse routes
  const bareCompare = pathname.match(/^\/compare\/([^/]+)\/([^/]+)$/);
  if (bareCompare) {
    const [, slugA, slugB] = bareCompare;
    if (slugA === "category") {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(`/compare/category/${slugB}`, defaultLocale);
      return NextResponse.redirect(url, 308);
    }
    if (slugA === "browse") {
      const url = request.nextUrl.clone();
      url.pathname = localizedPath(`/compare/category/${slugB}`, defaultLocale);
      return NextResponse.redirect(url, 308);
    }
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

import { permanentRedirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

type Props = { params: Promise<{ locale: Locale; category: string }> };

/** Old /compare/browse/laptops → /{locale}/compare/category/laptops */
export default async function LegacyBrowseRedirect({ params }: Props) {
  const { category, locale } = await params;
  permanentRedirect(localizedPath(`/compare/category/${category}`, locale));
}

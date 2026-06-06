import { permanentRedirect } from "next/navigation";
import { comparePairPath } from "@/lib/compare-url";
import type { Locale } from "@/lib/i18n";

/** Legacy two-segment URLs → /{locale}/compare/{a}-vs-{b} */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: Locale; slugA: string; slugB: string }> };

export default async function LegacyTwoSegmentCompareRedirect({ params }: Props) {
  const { slugA, slugB, locale } = await params;
  permanentRedirect(comparePairPath(slugA, slugB, locale));
}

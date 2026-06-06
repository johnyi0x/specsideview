"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { defaultLocale, localizedPath, type Locale } from "@/lib/i18n";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function LocaleLink({ href, ...props }: Props) {
  const params = useParams();
  const locale = (typeof params?.locale === "string" ? params.locale : defaultLocale) as Locale;
  const resolved = href.startsWith("http") ? href : localizedPath(href, locale);
  return <Link href={resolved} {...props} />;
}

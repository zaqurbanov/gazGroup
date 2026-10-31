import type { Metadata } from "next";
import { locales, ogLocales, type Locale } from "./i18n";

export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const abs = (path: string) => `${siteUrl}${path}`;

export const mediaUrl = (id: string) => `/api/media/${id}`;

/** `path` is the locale-less path, e.g. "" for home or "/products/oxygen". */
export function alternatesFor(locale: Locale, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, `/${l}${path}`]));
  languages["x-default"] = `/az${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

type PageMeta = {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
};

export function pageMetadata({ locale, path, title, description, image, type = "website" }: PageMeta): Metadata {
  const shareImage = image ?? "/og.jpg";
  const images = [{ url: shareImage }];
  return {
    title,
    description,
    alternates: alternatesFor(locale, path),
    openGraph: {
      type,
      title,
      description,
      url: `/${locale}${path}`,
      locale: ogLocales[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: [shareImage] },
  };
}

export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export const locales = ["az", "en", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "az";

export const localeLabels: Record<Locale, string> = {
  az: "AZ",
  en: "EN",
  ru: "RU",
};

export const ogLocales: Record<Locale, string> = {
  az: "az_AZ",
  en: "en_US",
  ru: "ru_RU",
};

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

/** Localized value stored in MongoDB. Azerbaijani is the required source. */
export type L10n = { az: string; en?: string; ru?: string };

export const pick = (value: L10n | undefined | null, locale: Locale): string =>
  (value && (value[locale] || value.az)) || "";

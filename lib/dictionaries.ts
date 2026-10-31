import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, type Locale } from "./i18n";

const dictionaries = {
  az: () => import("@/messages/az.json").then((m) => m.default),
  en: () => import("@/messages/en.json").then((m) => m.default),
  ru: () => import("@/messages/ru.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["az"]>>;

export const getDictionaryFor = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();

export const getLocale = async (): Promise<Locale> => {
  const value = await lang();
  if (!value || !hasLocale(value)) notFound();
  return value;
};

export const getDictionary = async () => getDictionaryFor(await getLocale());

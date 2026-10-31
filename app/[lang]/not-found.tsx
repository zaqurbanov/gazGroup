import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/dictionaries";

export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <section className="section-dark-solid flex min-h-dvh items-center">
      <div className="container-x max-w-2xl space-y-6">
        <p className="eyebrow">404</p>
        <h1 className="h-display">{dict.common.notFoundTitle}</h1>
        <p className="text-lg text-white/80">{dict.common.notFoundText}</p>
        <Link href={`/${locale}`} className="btn btn-primary">
          {dict.common.backHome}
        </Link>
      </div>
    </section>
  );
}

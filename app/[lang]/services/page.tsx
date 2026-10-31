import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { getServices } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/services",
    title: dict.services.pageTitle,
    description: dict.services.pageDescription,
  });
}

export default async function ServicesPage() {
  const [locale, dict, services] = await Promise.all([getLocale(), getDictionary(), getServices()]);
  return (
    <>
      <PageHero
        locale={locale}
        title={dict.services.pageTitle}
        lead={dict.services.subtitle}
        eyebrow={dict.services.eyebrow}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.services, path: "/services" },
        ]}
      />
      <section className="section section-light">
        <div className="container-x">
          {services.length === 0 && <p className="text-steel">{dict.services.empty}</p>}
          <ul className="grid gap-5 md:grid-cols-2">
            {services.map((s, i) => (
              <li key={s._id} className="reveal">
                <Link href={`/${locale}/services/${s.slug}`} className="card flex h-full gap-6 p-8">
                  <span aria-hidden="true" className="w-12 shrink-0 font-display text-3xl font-semibold text-emerald-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="space-y-2">
                    <span className="block font-display text-xl font-semibold">{pick(s.title, locale)}</span>
                    <span className="block leading-relaxed text-steel">{pick(s.summary, locale)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

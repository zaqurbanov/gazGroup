import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Media } from "@/components/ui/Media";
import { statusLabel } from "@/components/sections/shared";
import { getCategories, getProducts } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/products",
    title: dict.products.pageTitle,
    description: dict.products.pageDescription,
  });
}

export default async function ProductsPage() {
  const [locale, dict, categories, products] = await Promise.all([
    getLocale(),
    getDictionary(),
    getCategories(),
    getProducts(),
  ]);

  const groups = categories
    .map((c) => ({ category: c, items: products.filter((p) => p.category === c.slug) }))
    .filter((g) => g.items.length > 0);
  const known = new Set(categories.map((c) => c.slug));
  const loose = products.filter((p) => !known.has(p.category));

  return (
    <>
      <PageHero
        locale={locale}
        title={dict.products.pageTitle}
        lead={dict.products.subtitle}
        eyebrow={dict.products.eyebrow}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.products, path: "/products" },
        ]}
      />
      <section className="section section-light">
        <div className="container-x space-y-16">
          {products.length === 0 && <p className="text-steel">{dict.products.empty}</p>}
          {[...groups, ...(loose.length ? [{ category: null, items: loose }] : [])].map((g) => (
            <div key={g.category?._id ?? "other"} className="space-y-6">
              {g.category && (
                <div className="reveal max-w-2xl space-y-2">
                  <h2 className="h-section">{pick(g.category.title, locale)}</h2>
                  <p className="text-steel">{pick(g.category.description, locale)}</p>
                </div>
              )}
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p) => (
                  <li key={p._id} className="reveal">
                    <Link href={`/${locale}/products/${p.slug}`} className="card group flex h-full flex-col overflow-hidden">
                      {p.image && <Media id={p.image} alt={pick(p.name, locale)} className="aspect-[16/10]" />}
                      <span className="flex flex-1 flex-col gap-3 p-6">
                        <span className="font-display text-3xl font-semibold text-emerald">{p.formula}</span>
                        <span className="block font-display text-lg font-semibold">{pick(p.name, locale)}</span>
                        <span className="block text-sm leading-relaxed text-steel">{pick(p.summary, locale)}</span>
                        <span className="mt-auto flex items-center justify-between pt-3 text-xs font-bold">
                          <span className="rounded-full bg-mist px-3 py-1">{statusLabel(dict, p.stockStatus)}</span>
                          <span aria-hidden="true" className="text-base transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

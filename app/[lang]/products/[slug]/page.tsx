import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/JsonLd";
import { Media } from "@/components/ui/Media";
import { PageHero } from "@/components/ui/PageHero";
import { lines, statusLabel } from "@/components/sections/shared";
import { getCategories, getProduct, getProducts } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { abs, mediaUrl, pageMetadata, truncate } from "@/lib/seo";

export async function generateStaticParams() {
  const products = await getProducts();
  // Cache Components needs at least one entry. The placeholder renders as a 404.
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [locale, product] = await Promise.all([getLocale(), getProduct(slug)]);
  if (!product) return {};
  const name = pick(product.name, locale);
  return pageMetadata({
    locale,
    path: `/products/${slug}`,
    title: pick(product.seoTitle, locale) || name,
    description: pick(product.seoDescription, locale) || truncate(`${pick(product.summary, locale)} ${pick(product.description, locale)}`),
    image: product.image ? mediaUrl(product.image) : undefined,
  });
}

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[slug]">) {
  const { slug } = await params;
  const [locale, dict, product, categories, all] = await Promise.all([
    getLocale(),
    getDictionary(),
    getProduct(slug),
    getCategories(),
    getProducts(),
  ]);
  if (!product) notFound();

  const name = pick(product.name, locale);
  const category = categories.find((c) => c.slug === product.category);
  const related = all.filter((p) => p.slug !== slug).slice(0, 3);
  const applications = lines(pick(product.applications, locale));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: pick(product.description, locale) || pick(product.summary, locale),
    url: abs(`/${locale}/products/${slug}`),
    ...(product.image && { image: abs(mediaUrl(product.image)) }),
    ...(category && { category: pick(category.title, locale) }),
    ...(product.formula && { additionalProperty: { "@type": "PropertyValue", name: dict.common.formula, value: product.formula } }),
  };

  const specs = [
    { label: dict.common.formula, value: product.formula },
    { label: dict.common.purity, value: product.purity },
    { label: dict.common.category, value: category ? pick(category.title, locale) : "" },
    { label: dict.stock.eyebrow, value: statusLabel(dict, product.stockStatus) },
  ].filter((s) => s.value);

  return (
    <>
      <PageHero
        locale={locale}
        title={name}
        lead={pick(product.summary, locale)}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.products, path: "/products" },
          { name: name, path: `/products/${slug}` },
        ]}
      />

      <section className="section section-light">
        <div className="container-x grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-10">
            {product.image && <Media id={product.image} alt={name} className="aspect-[16/9] rounded-2xl" priority sizes="(min-width: 1024px) 60vw, 100vw" />}
            <div className="prose-gas max-w-none text-lg text-deep/90">
              {pick(product.description, locale)
                .split(/\n{2,}/)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
            {applications.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">{dict.common.applications}</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {applications.map((a) => (
                    <li key={a} className="flex items-center gap-3 rounded-xl bg-mist px-4 py-3 text-sm font-semibold">
                      <span aria-hidden="true" className="size-2 rounded-full bg-emerald" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-6 rounded-2xl bg-ink p-7 text-white lg:sticky lg:top-28">
            <dl className="space-y-4">
              {specs.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 border-b border-white/15 pb-3">
                  <dt className="text-sm text-white/70">{s.label}</dt>
                  <dd className="font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/${locale}/contact?product=${slug}`} className="btn btn-primary w-full">
              {dict.common.requestQuote}
            </Link>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section-mist">
          <div className="container-x space-y-8">
            <h2 className="h-section">{dict.common.relatedProducts}</h2>
            <ul className="grid gap-5 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p._id}>
                  <Link href={`/${locale}/products/${p.slug}`} className="card block space-y-2 p-6">
                    <span className="font-display text-2xl font-semibold text-emerald-ink">{p.formula}</span>
                    <span className="block font-display font-semibold">{pick(p.name, locale)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <JsonLd data={jsonLd} />
    </>
  );
}

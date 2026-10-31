import Link from "next/link";
import { gasForSlug } from "@/components/three/gases";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";
import type { ProductDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";

export function ProductsSection({ locale, dict, products }: { locale: Locale; dict: Dictionary; products: ProductDTO[] }) {
  return (
    <section id="products" data-scene="products" className="section section-dark relative z-[1]">
      <div className="container-x space-y-12">
        <SectionHeading eyebrow={dict.products.eyebrow} title={dict.products.title} subtitle={dict.products.subtitle} />

        {products.length === 0 ? (
          <p className="text-white/70">{dict.products.empty}</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p) => (
              <li key={p._id} className="reveal">
                <Link
                  href={`/${locale}/products/${p.slug}`}
                  data-gas={gasForSlug(p.slug)}
                  className="glass group flex h-full flex-col gap-4 p-6 transition-all hover:-translate-y-1 hover:border-emerald/70"
                >
                  <span className="font-display text-4xl font-semibold text-emerald">{p.formula}</span>
                  <span className="space-y-2">
                    <span className="block font-display text-lg font-semibold">{pick(p.name, locale)}</span>
                    <span className="block text-sm leading-relaxed text-white/75">{pick(p.summary, locale)}</span>
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-2 text-sm font-bold">
                    {p.purity ? <span className="text-white/70">{p.purity}</span> : <span />}
                    <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                    <span className="sr-only">{dict.common.learnMore}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link href={`/${locale}/products`} className="btn btn-ghost">
          {dict.common.viewAll}
        </Link>
      </div>
    </section>
  );
}

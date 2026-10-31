import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";
import type { ProductDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";
import { statusLabel, statusTone } from "./shared";

export function StockSection({ locale, dict, products }: { locale: Locale; dict: Dictionary; products: ProductDTO[] }) {
  const items = products.filter((p) => p.showInStock);
  if (items.length === 0) return null;

  return (
    <section id="stock" data-scene="stock" className="section section-dark relative z-[1]">
      <div className="container-x space-y-10">
        <SectionHeading eyebrow={dict.stock.eyebrow} title={dict.stock.title} subtitle={dict.stock.subtitle} />
        <ul className="max-w-3xl divide-y divide-white/15 rounded-2xl border border-white/15 bg-ink/55 backdrop-blur-md">
          {items.map((p) => (
            <li key={p._id} className="reveal flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 sm:px-6">
              <span className="w-14 shrink-0 font-display text-lg font-semibold text-emerald">{p.formula}</span>
              <span className="min-w-0 basis-[calc(100%-5rem)] font-semibold sm:flex-1 sm:basis-auto">{pick(p.name, locale)}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone[p.stockStatus]}`}>
                {statusLabel(dict, p.stockStatus)}
              </span>
              <Link
                href={`/${locale}/contact?product=${p.slug}`}
                className="text-sm font-bold text-emerald underline-offset-4 hover:underline"
              >
                {dict.stock.order}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

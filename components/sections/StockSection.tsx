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
        <ul className="max-w-3xl divide-y divide-white/15 rounded-2xl border border-white/15 bg-ink/95 shadow-2xl shadow-black/30">
          {items.map((p) => (
            // One row at every width: the cells shrink on phones instead of wrapping onto a second line.
            <li key={p._id} className="reveal flex items-center gap-x-2.5 px-3.5 py-3.5 sm:gap-x-5 sm:px-6 sm:py-4">
              <span className="w-10 shrink-0 font-display text-base font-semibold text-emerald sm:w-14 sm:text-lg">{p.formula}</span>
              <span className="min-w-0 flex-1 text-sm font-semibold leading-tight sm:text-base">{pick(p.name, locale)}</span>
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-xs ${statusTone[p.stockStatus]}`}
              >
                {statusLabel(dict, p.stockStatus)}
              </span>
              <Link
                href={`/${locale}/contact?product=${p.slug}`}
                className="shrink-0 whitespace-nowrap text-xs font-bold text-emerald underline-offset-4 hover:underline sm:text-sm"
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

import type { FaqDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";

/** Native <details> keeps the answers in the HTML for crawlers and works without JavaScript. */
export function FaqList({ locale, faqs, dark = false }: { locale: Locale; faqs: FaqDTO[]; dark?: boolean }) {
  return (
    <div className={`divide-y ${dark ? "divide-white/15 border-white/15" : "divide-line border-line"} rounded-2xl border`}>
      {faqs.map((f) => (
        <details key={f._id} className="group reveal px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-1 font-display text-base font-semibold [&::-webkit-details-marker]:hidden">
            {pick(f.question, locale)}
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-current text-lg leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className={`pb-3 pt-3 leading-relaxed ${dark ? "text-white/80" : "text-steel"}`}>{pick(f.answer, locale)}</p>
        </details>
      ))}
    </div>
  );
}

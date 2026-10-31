import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";
import type { ServiceDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";

export function ServicesSection({ locale, dict, services }: { locale: Locale; dict: Dictionary; services: ServiceDTO[] }) {
  if (services.length === 0) return null;
  return (
    <section data-scene="services" className="section section-mist">
      <div className="container-x space-y-12">
        <SectionHeading eyebrow={dict.services.eyebrow} title={dict.services.title} subtitle={dict.services.subtitle} />
        <ul className="grid gap-5 md:grid-cols-2">
          {services.map((s, i) => (
            <li key={s._id} className="reveal">
              <Link href={`/${locale}/services/${s.slug}`} className="card group flex h-full gap-6 p-7">
                <span className="font-display text-3xl font-semibold text-emerald" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="space-y-2">
                  <span className="block font-display text-lg font-semibold">{pick(s.title, locale)}</span>
                  <span className="block text-sm leading-relaxed text-steel">{pick(s.summary, locale)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

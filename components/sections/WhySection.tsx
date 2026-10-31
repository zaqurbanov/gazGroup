import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";
import type { CertificateDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";

export function WhySection({
  locale,
  dict,
  certificates,
}: {
  locale: Locale;
  dict: Dictionary;
  certificates: CertificateDTO[];
}) {
  return (
    <section data-scene="why" className="section section-light">
      <div className="container-x space-y-16">
        <div className="space-y-12">
          <SectionHeading eyebrow={dict.why.eyebrow} title={dict.why.title} />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dict.why.items.map((item, i) => (
              <li key={item.title} className="card reveal space-y-3 p-7">
                <span className="font-display text-sm font-semibold text-steel">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-steel">{item.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {certificates.length > 0 && (
          <div className="space-y-8">
            <SectionHeading eyebrow={dict.certs.eyebrow} title={dict.certs.title} subtitle={dict.certs.subtitle} />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {certificates.map((c) => (
                <li key={c._id} className="card reveal overflow-hidden">
                  <Media id={c.image} alt={pick(c.title, locale)} className="aspect-[4/3]" sizes="(min-width: 1024px) 25vw, 50vw" />
                  <div className="space-y-1 p-5">
                    <h3 className="font-display text-sm font-semibold">{pick(c.title, locale)}</h3>
                    {c.description.az && <p className="text-sm text-steel">{pick(c.description, locale)}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

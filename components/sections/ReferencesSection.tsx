import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";
import type { PartnerDTO, ProjectDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";

export function LogoRow({ title, items }: { title: string; items: PartnerDTO[] }) {
  if (items.length === 0) return null;
  // Duplicated once so the marquee loops seamlessly; the copy is hidden from assistive tech.
  const loop = items.length > 3;
  return (
    <div className="space-y-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{title}</h3>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className={loop ? "marquee-track" : "flex flex-wrap gap-10"}>
          {(loop ? [...items, ...items] : items).map((p, i) => (
            <li key={`${p._id}-${i}`} aria-hidden={loop && i >= items.length ? true : undefined} className="flex h-16 w-40 shrink-0 items-center justify-center rounded-xl bg-white p-3">
              {p.logo ? (
                <Media id={p.logo} alt={p.name} className="h-full w-full [&_img]:object-contain" sizes="160px" />
              ) : (
                <span className="font-display text-sm font-semibold text-deep">{p.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ReferencesSection({
  locale,
  dict,
  projects,
  clients,
  partners,
}: {
  locale: Locale;
  dict: Dictionary;
  projects: ProjectDTO[];
  clients: PartnerDTO[];
  partners: PartnerDTO[];
}) {
  if (projects.length + clients.length + partners.length === 0) return null;
  return (
    <section data-scene="references" className="section section-dark relative z-[1]">
      <div className="container-x space-y-16">
        {projects.length > 0 && (
          <div className="space-y-10">
            <SectionHeading eyebrow={dict.projects.eyebrow} title={dict.projects.title} />
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.slice(0, 3).map((p) => (
                <li key={p._id} className="reveal">
                  <Link href={`/${locale}/projects/${p.slug}`} className="card group block overflow-hidden">
                    <Media id={p.image} alt={pick(p.title, locale)} className="aspect-[16/10]" />
                    <span className="block space-y-2 p-6">
                      <span className="block font-display text-base font-semibold">{pick(p.title, locale)}</span>
                      <span className="block text-sm text-steel">{pick(p.summary, locale)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <LogoRow title={dict.clients.title} items={clients} />
        <LogoRow title={dict.partners.title} items={partners} />
      </div>
    </section>
  );
}

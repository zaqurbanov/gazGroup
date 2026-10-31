import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { abs } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

export type Crumb = { name: string; path: string };

/** Compact dark banner for inner pages, with visible breadcrumbs and BreadcrumbList JSON-LD. */
export function PageHero({
  locale,
  title,
  lead,
  crumbs,
  eyebrow,
}: {
  locale: Locale;
  title: string;
  lead?: string;
  crumbs: Crumb[];
  eyebrow?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(`/${locale}${c.path}`),
    })),
  };

  return (
    <section
      className="section-dark-solid relative overflow-hidden pb-16 pt-36 md:pb-24 md:pt-44"
      style={{
        backgroundImage:
          "radial-gradient(40rem 26rem at 85% 20%, color-mix(in oklab, var(--emerald) 24%, transparent), transparent 70%)",
      }}
    >
      <div className="container-x relative space-y-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-white">
                    {c.name}
                  </span>
                ) : (
                  <Link href={`/${locale}${c.path}`} className="hover:text-emerald">
                    {c.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="h-display max-w-4xl">{title}</h1>
        {lead && <p className="max-w-2xl text-lg leading-relaxed text-white/80">{lead}</p>}
      </div>
      <JsonLd data={jsonLd} />
    </section>
  );
}

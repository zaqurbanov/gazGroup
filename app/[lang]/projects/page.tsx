import type { Metadata } from "next";
import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { PageHero } from "@/components/ui/PageHero";
import { getProjects } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({
    locale,
    path: "/projects",
    title: dict.projects.pageTitle,
    description: dict.projects.pageDescription,
  });
}

export default async function ProjectsPage() {
  const [locale, dict, projects] = await Promise.all([getLocale(), getDictionary(), getProjects()]);
  return (
    <>
      <PageHero
        locale={locale}
        title={dict.projects.pageTitle}
        lead={dict.projects.title}
        eyebrow={dict.projects.eyebrow}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.projects, path: "/projects" },
        ]}
      />
      <section className="section section-light">
        <div className="container-x">
          {projects.length === 0 && <p className="text-steel">{dict.projects.empty}</p>}
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p._id} className="reveal">
                <Link href={`/${locale}/projects/${p.slug}`} className="card block overflow-hidden">
                  <Media id={p.image} alt={pick(p.title, locale)} className="aspect-[16/10]" />
                  <span className="block space-y-2 p-6">
                    <span className="block font-display text-lg font-semibold">{pick(p.title, locale)}</span>
                    <span className="block text-sm leading-relaxed text-steel">{pick(p.summary, locale)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

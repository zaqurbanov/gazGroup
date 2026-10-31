import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/JsonLd";
import { Media } from "@/components/ui/Media";
import { PageHero } from "@/components/ui/PageHero";
import { getProject, getProjects } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { abs, mediaUrl, pageMetadata, truncate } from "@/lib/seo";

export async function generateStaticParams() {
  const projects = await getProjects();
  // Cache Components needs at least one entry. The placeholder renders as a 404.
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [locale, project] = await Promise.all([getLocale(), getProject(slug)]);
  if (!project) return {};
  return pageMetadata({
    locale,
    path: `/projects/${slug}`,
    title: pick(project.seoTitle, locale) || pick(project.title, locale),
    description: pick(project.seoDescription, locale) || truncate(`${pick(project.summary, locale)} ${pick(project.description, locale)}`),
    image: project.image ? mediaUrl(project.image) : undefined,
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { slug } = await params;
  const [locale, dict, project] = await Promise.all([getLocale(), getDictionary(), getProject(slug)]);
  if (!project) notFound();

  const title = pick(project.title, locale);
  const facts = [
    { label: dict.projects.client, value: project.client },
    { label: dict.projects.year, value: project.year },
  ].filter((f) => f.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: pick(project.description, locale) || pick(project.summary, locale),
    url: abs(`/${locale}/projects/${slug}`),
    inLanguage: locale,
    ...(project.image && { image: abs(mediaUrl(project.image)) }),
    ...(project.client && { sponsor: { "@type": "Organization", name: project.client } }),
  };

  return (
    <>
      <PageHero
        locale={locale}
        title={title}
        lead={pick(project.summary, locale)}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.projects, path: "/projects" },
          { name: title, path: `/projects/${slug}` },
        ]}
      />
      <section className="section section-light">
        <div className="container-x max-w-4xl space-y-10">
          {project.image && <Media id={project.image} alt={title} className="aspect-[16/9] rounded-2xl" priority sizes="(min-width: 1024px) 60vw, 100vw" />}
          {facts.length > 0 && (
            <dl className="flex flex-wrap gap-x-12 gap-y-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-bold uppercase tracking-[0.18em] text-steel">{f.label}</dt>
                  <dd className="font-display text-lg font-semibold">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className="prose-gas text-lg text-deep/90">
            {pick(project.description, locale)
              .split(/\n{2,}/)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
          <Link href={`/${locale}/contact`} className="btn btn-primary">
            {dict.common.contactUs}
          </Link>
        </div>
      </section>
      <JsonLd data={jsonLd} />
    </>
  );
}

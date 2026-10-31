import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/ui/JsonLd";
import { Media } from "@/components/ui/Media";
import { PageHero } from "@/components/ui/PageHero";
import { getService, getServices, getSettings } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { abs, mediaUrl, pageMetadata, truncate } from "@/lib/seo";

export async function generateStaticParams() {
  const services = await getServices();
  // Cache Components needs at least one entry. The placeholder renders as a 404.
  return services.length ? services.map((s) => ({ slug: s.slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [locale, service] = await Promise.all([getLocale(), getService(slug)]);
  if (!service) return {};
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: pick(service.seoTitle, locale) || pick(service.title, locale),
    description: pick(service.seoDescription, locale) || truncate(`${pick(service.summary, locale)} ${pick(service.description, locale)}`),
    image: service.image ? mediaUrl(service.image) : undefined,
  });
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { slug } = await params;
  const [locale, dict, service, settings] = await Promise.all([
    getLocale(),
    getDictionary(),
    getService(slug),
    getSettings(),
  ]);
  if (!service) notFound();

  const title = pick(service.title, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description: pick(service.description, locale) || pick(service.summary, locale),
    url: abs(`/${locale}/services/${slug}`),
    provider: { "@type": "Organization", name: settings.siteName, url: abs(`/${locale}`) },
  };

  return (
    <>
      <PageHero
        locale={locale}
        title={title}
        lead={pick(service.summary, locale)}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.services, path: "/services" },
          { name: title, path: `/services/${slug}` },
        ]}
      />
      <section className="section section-light">
        <div className="container-x max-w-4xl space-y-10">
          {service.image && <Media id={service.image} alt={title} className="aspect-[16/9] rounded-2xl" priority sizes="(min-width: 1024px) 60vw, 100vw" />}
          <div className="prose-gas text-lg text-deep/90">
            {pick(service.description, locale)
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

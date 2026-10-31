import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactDetails } from "@/components/sections/ContactSection";
import { ContactForm } from "@/components/ui/ContactForm";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { getProduct, getSettings } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { abs, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({ locale, path: "/contact", title: dict.nav.contact, description: dict.contact.pageDescription });
}

/** `?product=slug` links (from the stock list and product pages) pre-fill the message. */
async function PrefilledForm({ searchParams }: { searchParams: PageProps<"/[lang]/contact">["searchParams"] }) {
  const [locale, dict, { product }] = await Promise.all([getLocale(), getDictionary(), searchParams]);
  const slug = typeof product === "string" ? product : "";
  const found = slug ? await getProduct(slug) : null;
  const message = found ? `${pick(found.name, locale)}: ` : "";
  return (
    <ContactForm
      locale={locale}
      labels={dict.contact}
      page={`/${locale}/contact`}
      defaultMessage={message}
      product={found ? found.slug : ""}
    />
  );
}

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.siteName,
    url: abs(`/${locale}`),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    ...(settings.address.az && { address: { "@type": "PostalAddress", streetAddress: pick(settings.address, locale) } }),
  };

  return (
    <>
      <PageHero
        locale={locale}
        title={dict.contact.title}
        lead={dict.contact.subtitle}
        eyebrow={dict.contact.eyebrow}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.contact, path: "/contact" },
        ]}
      />
      <section className="section-dark-solid section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <ContactDetails locale={locale} dict={dict} settings={settings} />
          <Suspense fallback={<ContactForm locale={locale} labels={dict.contact} page={`/${locale}/contact`} />}>
            <PrefilledForm searchParams={props.searchParams} />
          </Suspense>
        </div>
      </section>
      <JsonLd data={jsonLd} />
    </>
  );
}

import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { DeliveryStory } from "@/components/sections/DeliveryStory";
import { ContactSection } from "@/components/sections/ContactSection";
import { Hero } from "@/components/sections/Hero";
import { ProductsSection } from "@/components/sections/ProductsSection";
import { ReferencesSection } from "@/components/sections/ReferencesSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { StockSection } from "@/components/sections/StockSection";
import { WhySection } from "@/components/sections/WhySection";
import { SceneBackdrop } from "@/components/three/SceneBackdrop";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  getCertificates,
  getFaqs,
  getPartners,
  getProducts,
  getProjects,
  getServices,
  getSettings,
} from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { abs, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);
  const title = pick(settings.seoTitle, locale) || `${settings.siteName} | ${dict.meta.tagline}`;
  const description = pick(settings.seoDescription, locale) || dict.meta.description;
  return { ...pageMetadata({ locale, path: "", title, description }), title: { absolute: title } };
}

export default async function HomePage() {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);
  const [products, services, projects, partners, certificates, faqs] = await Promise.all([
    getProducts(),
    getServices(),
    getProjects(),
    getPartners(),
    getCertificates(),
    getFaqs(),
  ]);

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: abs(`/${locale}`),
    inLanguage: locale,
  };

  return (
    <>
      <SceneBackdrop />
      <div className="relative">
        <Hero locale={locale} dict={dict} />
        <About dict={dict} settings={settings} />
        <ProductsSection locale={locale} dict={dict} products={products} />
        <WhySection locale={locale} dict={dict} certificates={certificates} scene />
        <StockSection locale={locale} dict={dict} products={products} />
        <DeliveryStory dict={dict} />
        <ServicesSection locale={locale} dict={dict} services={services} />
        <ReferencesSection
          locale={locale}
          dict={dict}
          projects={projects}
          clients={partners.filter((p) => p.kind === "client")}
          partners={partners.filter((p) => p.kind === "partner")}
        />
        <ContactSection locale={locale} dict={dict} settings={settings} faqs={faqs} />
      </div>
      <JsonLd data={website} />
    </>
  );
}

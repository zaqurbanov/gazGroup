import type { Metadata } from "next";
import { FaqList } from "@/components/sections/FaqList";
import { JsonLd } from "@/components/ui/JsonLd";
import { PageHero } from "@/components/ui/PageHero";
import { getFaqs } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pick } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({ locale, path: "/faq", title: dict.faq.title, description: dict.faq.pageDescription });
}

export default async function FaqPage() {
  const [locale, dict, faqs] = await Promise.all([getLocale(), getDictionary(), getFaqs()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: pick(f.question, locale),
      acceptedAnswer: { "@type": "Answer", text: pick(f.answer, locale) },
    })),
  };

  return (
    <>
      <PageHero
        locale={locale}
        title={dict.faq.title}
        lead={dict.faq.pageDescription}
        eyebrow={dict.faq.eyebrow}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.faq, path: "/faq" },
        ]}
      />
      <section className="section section-light">
        <div className="container-x max-w-3xl">
          {faqs.length === 0 ? <p className="text-steel">{dict.faq.empty}</p> : <FaqList locale={locale} faqs={faqs} />}
        </div>
      </section>
      {faqs.length > 0 && <JsonLd data={jsonLd} />}
    </>
  );
}

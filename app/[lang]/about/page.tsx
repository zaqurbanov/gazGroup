import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { WhySection } from "@/components/sections/WhySection";
import { PageHero } from "@/components/ui/PageHero";
import { getCertificates, getSettings } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return pageMetadata({ locale, path: "/about", title: dict.nav.about, description: dict.about.text1 });
}

export default async function AboutPage() {
  const [locale, dict, settings, certificates] = await Promise.all([
    getLocale(),
    getDictionary(),
    getSettings(),
    getCertificates(),
  ]);

  return (
    <>
      <PageHero
        locale={locale}
        title={dict.about.title}
        lead={dict.about.text1}
        eyebrow={dict.about.eyebrow}
        crumbs={[
          { name: dict.nav.home, path: "" },
          { name: dict.nav.about, path: "/about" },
        ]}
      />
      <div className="bg-ink">
        <About dict={dict} settings={settings} />
      </div>
      <WhySection locale={locale} dict={dict} certificates={certificates} />
    </>
  );
}

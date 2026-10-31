import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import { ContactFab } from "@/components/ui/ContactFab";
import { Footer } from "@/components/ui/Footer";
import { Header } from "@/components/ui/Header";
import { JsonLd } from "@/components/ui/JsonLd";
import { Logo } from "@/components/ui/Logo";
import { getSettings } from "@/lib/data";
import { getDictionary, getLocale } from "@/lib/dictionaries";
import { locales, pick } from "@/lib/i18n";
import { abs, mediaUrl, siteUrl } from "@/lib/seo";
import "../globals.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0f3d5e",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);
  const title = pick(settings.seoTitle, locale) || `${settings.siteName} | ${dict.meta.tagline}`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${settings.siteName}` },
    description: pick(settings.seoDescription, locale) || dict.meta.description,
    applicationName: settings.siteName,
    robots: { index: true, follow: true },
    openGraph: { siteName: settings.siteName },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, dict, settings] = await Promise.all([getLocale(), getDictionary(), getSettings()]);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: abs(`/${locale}`),
    description: dict.meta.description,
    ...(settings.logo && { logo: abs(mediaUrl(settings.logo)) }),
    ...(settings.email && { email: settings.email }),
    ...(settings.phone && { telephone: settings.phone }),
    sameAs: [settings.instagram, settings.facebook, settings.linkedin].filter(Boolean),
  };

  const whatsapp = settings.whatsapp.replace(/\D/g, "");

  return (
    <html lang={locale} className={`${manrope.variable} ${unbounded.variable}`}>
      <body className="min-h-dvh bg-white antialiased">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-emerald px-5 py-3 font-bold text-ink focus:translate-y-0"
        >
          {dict.common.skipToContent}
        </a>
        <Header
          locale={locale}
          labels={dict.nav}
          logo={<Logo name={settings.siteName} logo={settings.logo} />}
        />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} settings={settings} />

        <ContactFab
          locale={locale}
          label={dict.common.contactUs}
          whatsapp={whatsapp}
          whatsappLabel={dict.contact.whatsapp}
        />
        <JsonLd data={organization} />
      </body>
    </html>
  );
}

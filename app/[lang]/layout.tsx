import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
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
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-emerald px-5 py-3 font-bold text-deep focus:translate-y-0"
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

        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={dict.contact.whatsapp}
            className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-emerald text-deep shadow-xl shadow-black/25 transition-transform hover:scale-105"
          >
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.3c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a11 11 0 0 1-4.9-3.5c-1-1.2-1.7-2.7-1.8-3.2 0-.5.2-1 .5-1.4.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.5.4 0 .2 0 .8-.2 1.3Z" />
            </svg>
          </a>
        )}
        <JsonLd data={organization} />
      </body>
    </html>
  );
}

import Link from "next/link";
import { cacheLife } from "next/cache";
import type { Dictionary } from "@/lib/dictionaries";
import type { SettingsDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";

const links = [
  { key: "about", href: "/about" },
  { key: "products", href: "/products" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/projects" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
] as const;

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: SettingsDTO }) {
  const social = [
    { label: "Instagram", href: settings.instagram },
    { label: "Facebook", href: settings.facebook },
    { label: "LinkedIn", href: settings.linkedin },
  ].filter((s) => s.href);

  return (
    <footer className="section-dark-solid relative z-10">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo name={settings.siteName} logo={settings.logo} />
          <p className="max-w-sm text-sm leading-relaxed text-white/75">{dict.meta.tagline}</p>
          {social.length > 0 && (
            <ul className="flex gap-4 text-sm font-semibold">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-emerald">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label={dict.footer.navigation}>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-emerald">
            {dict.footer.navigation}
          </h2>
          <ul className="space-y-2.5 text-sm text-white/80">
            {links.map(({ key, href }) => (
              <li key={key}>
                <Link href={`/${locale}${href}`} className="hover:text-emerald">
                  {dict.nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-emerald">
            {dict.footer.contacts}
          </h2>
          <address className="space-y-2.5 text-sm not-italic text-white/80">
            {settings.address.az && <p>{pick(settings.address, locale)}</p>}
            {settings.phone && (
              <p>
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="hover:text-emerald">
                  {settings.phone}
                </a>
              </p>
            )}
            {settings.email && (
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-emerald">
                  {settings.email}
                </a>
              </p>
            )}
            {settings.hours.az && <p>{pick(settings.hours, locale)}</p>}
          </address>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-5 text-xs text-white/60">
          © <Year /> {settings.siteName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}

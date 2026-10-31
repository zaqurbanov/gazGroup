import { ContactForm } from "@/components/ui/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/dictionaries";
import type { FaqDTO, SettingsDTO } from "@/lib/data";
import { pick, type Locale } from "@/lib/i18n";
import { FaqList } from "./FaqList";

export function ContactDetails({ locale, dict, settings }: { locale: Locale; dict: Dictionary; settings: SettingsDTO }) {
  const rows = [
    { label: dict.contact.address, value: pick(settings.address, locale) },
    { label: dict.contact.phone, value: settings.phone, href: settings.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : "" },
    { label: dict.contact.email, value: settings.email, href: settings.email ? `mailto:${settings.email}` : "" },
    { label: dict.contact.hours, value: pick(settings.hours, locale) },
  ].filter((r) => r.value);

  return (
    <dl className="space-y-5">
      {rows.map((r) => (
        <div key={r.label}>
          <dt className="text-xs font-bold uppercase tracking-[0.18em] text-emerald">{r.label}</dt>
          <dd className="mt-1 text-lg">
            {r.href ? (
              <a href={r.href} className="hover:text-emerald">
                {r.value}
              </a>
            ) : (
              r.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ContactSection({
  locale,
  dict,
  settings,
  faqs,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: SettingsDTO;
  faqs: FaqDTO[];
}) {
  return (
    <section id="contact" data-scene="contact" className="section section-dark relative z-[1]">
      <div className="container-x space-y-20">
        {faqs.length > 0 && (
          <div className="max-w-3xl space-y-8">
            <SectionHeading eyebrow={dict.faq.eyebrow} title={dict.faq.title} />
            <FaqList locale={locale} faqs={faqs.slice(0, 5)} dark />
          </div>
        )}

        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-8">
            <SectionHeading eyebrow={dict.contact.eyebrow} title={dict.contact.title} subtitle={dict.contact.subtitle} />
            <ContactDetails locale={locale} dict={dict} settings={settings} />
          </div>
          <ContactForm locale={locale} labels={dict.contact} page={`/${locale}`} />
        </div>
      </div>
    </section>
  );
}

import type { Dictionary } from "@/lib/dictionaries";
import type { SettingsDTO } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About({ dict, settings }: { dict: Dictionary; settings: SettingsDTO }) {
  // Figures are only shown when the admin has entered them. Nothing is invented.
  const stats = [
    { value: settings.statYears, label: dict.about.stats.years },
    { value: settings.statClients, label: dict.about.stats.clients },
    { value: settings.statProducts, label: dict.about.stats.products },
    { value: settings.statProjects, label: dict.about.stats.projects },
  ].filter((s) => s.value);

  return (
    <section id="about" data-scene="about" className="section section-dark relative z-[1]">
      <div className="container-x space-y-14">
        <div className="max-w-2xl space-y-6">
          <SectionHeading eyebrow={dict.about.eyebrow} title={dict.about.title} />
          <p className="reveal text-lg leading-relaxed text-white/80">{dict.about.text1}</p>
          <p className="reveal leading-relaxed text-white/70">{dict.about.text2}</p>
        </div>

        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          {[
            { t: dict.about.missionTitle, p: dict.about.missionText },
            { t: dict.about.visionTitle, p: dict.about.visionText },
          ].map((item) => (
            <article key={item.t} className="glass reveal space-y-3 p-6">
              <h3 className="font-display text-base font-semibold text-emerald">{item.t}</h3>
              <p className="text-sm leading-relaxed text-white/80">{item.p}</p>
            </article>
          ))}
        </div>

        {stats.length > 0 && (
          <dl className="grid max-w-3xl grid-cols-2 gap-6 border-t border-white/15 pt-10 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="reveal">
                <dt className="order-2 mt-1 text-xs uppercase tracking-wider text-white/65">{s.label}</dt>
                <dd className="font-display text-3xl font-semibold text-emerald">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

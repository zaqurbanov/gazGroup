import Link from "next/link";
import { HeroVideo } from "@/components/ui/HeroVideo";
import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section data-scene="hero" className="section-dark relative z-[1] flex min-h-dvh items-center overflow-hidden bg-ink pb-20 pt-32">
      <HeroVideo />
      {/* Keeps text readable over the footage and melts its lower edge into the next section. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/60 md:bg-transparent md:bg-gradient-to-r md:from-ink md:via-ink/70 md:to-transparent"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />
      <div className="container-x relative">
        <div className="max-w-2xl space-y-8">
          <h1 className="space-y-6">
            <span className="eyebrow block">{dict.hero.eyebrow}</span>
            <span className="h-display block">{dict.hero.title}</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/80">{dict.hero.subtitle}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`/${locale}/products`} className="btn btn-primary">
              {dict.hero.ctaPrimary}
            </Link>
            <Link href={`/${locale}/contact`} className="btn btn-ghost">
              {dict.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
      <a
        href="#about"
        aria-label={dict.common.scroll}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70 md:flex"
      >
        {dict.common.scroll}
        <span className="block h-10 w-px bg-gradient-to-b from-emerald to-transparent" />
      </a>
    </section>
  );
}

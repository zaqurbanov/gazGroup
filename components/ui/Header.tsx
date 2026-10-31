"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, localeLabels, type Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
  logo: React.ReactNode;
  labels: { home: string; about: string; products: string; services: string; projects: string; faq: string; contact: string; menu: string; close: string };
};

const items = [
  { key: "about", href: "/about" },
  { key: "products", href: "/products" },
  { key: "services", href: "/services" },
  { key: "projects", href: "/projects" },
  { key: "contact", href: "/contact" },
] as const;

export function Header({ locale, logo, labels }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const rest = pathname.replace(/^\/(az|en|ru)(?=\/|$)/, "");
  const isActive = (href: string) => rest === href || rest.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-colors duration-300 ${
        scrolled || open ? "bg-ink/85 shadow-lg shadow-black/10 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-6">
        <Link href={`/${locale}`} aria-label={labels.home} onClick={() => setOpen(false)}>
          {logo}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {items.map(({ key, href }) => (
            <Link
              key={key}
              href={`/${locale}${href}`}
              aria-current={isActive(href) ? "page" : undefined}
              className={`relative py-2 text-sm font-semibold transition-colors hover:text-emerald ${
                isActive(href) ? "text-emerald" : "text-white/90"
              }`}
            >
              {labels[key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-1 text-xs font-bold" aria-label="Language">
            {locales.map((l) => (
              <li key={l}>
                <Link
                  href={`/${l}${rest}`}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === locale ? "true" : undefined}
                  className={`rounded-full px-2.5 py-1.5 transition-colors ${
                    l === locale ? "bg-emerald text-deep" : "text-white/80 hover:text-white"
                  }`}
                >
                  {localeLabels[l]}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-white/30 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? labels.close : labels.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-5 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        hidden={!open}
        className="container-x flex h-[calc(100dvh-4.5rem)] flex-col gap-1 overflow-y-auto pb-10 pt-4 lg:hidden"
      >
        {[{ key: "home", href: "" }, ...items, { key: "faq", href: "/faq" }].map(({ key, href }) => (
          <Link
            key={key}
            href={`/${locale}${href}`}
            onClick={() => setOpen(false)}
            className="border-b border-white/15 py-4 font-display text-xl font-medium"
          >
            {labels[key as keyof typeof labels]}
          </Link>
        ))}
      </nav>
    </header>
  );
}

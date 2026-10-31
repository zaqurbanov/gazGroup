"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

/**
 * Floating contact button. Appears once the visitor scrolls, pulses to draw attention,
 * and stacks the WhatsApp shortcut above itself when a number is configured.
 */
export function ContactFab({
  locale,
  label,
  whatsapp,
  whatsappLabel,
}: {
  locale: Locale;
  label: string;
  whatsapp: string;
  whatsappLabel: string;
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The contact page already is the destination.
  const onContactPage = pathname.endsWith("/contact");

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3 transition-all duration-500 sm:bottom-7 sm:right-7 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
      aria-hidden={!visible}
    >
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={whatsappLabel}
          tabIndex={visible ? 0 : -1}
          className="grid size-12 place-items-center rounded-full bg-white text-deep shadow-lg shadow-black/25 ring-1 ring-black/5 transition-transform hover:scale-105"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.8 14.3c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1a11 11 0 0 1-4.9-3.5c-1-1.2-1.7-2.7-1.8-3.2 0-.5.2-1 .5-1.4.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.5.4 0 .2 0 .8-.2 1.3Z" />
          </svg>
        </a>
      )}

      {!onContactPage && (
        <Link
          href={`/${locale}/contact`}
          aria-label={label}
          title={label}
          tabIndex={visible ? 0 : -1}
          className="fab-pulse relative grid size-14 place-items-center rounded-full bg-emerald text-ink shadow-xl shadow-emerald/30 transition-transform hover:scale-105 sm:size-16"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.1A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
            <path d="M8 10.5h8M8 14h5" />
          </svg>
        </Link>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { submitLead, type LeadState } from "@/app/actions/lead";
import type { Locale } from "@/lib/i18n";

type Labels = {
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  send: string;
  sending: string;
  success: string;
  error: string;
  tooMany: string;
};

const field =
  "w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 transition-colors focus:border-emerald focus:bg-white/15 focus:outline-none";

export function ContactForm({
  locale,
  labels,
  page,
  defaultMessage = "",
  product = "",
}: {
  locale: Locale;
  labels: Labels;
  page: string;
  defaultMessage?: string;
  product?: string;
}) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });

  if (state.status === "ok") {
    return (
      <p role="status" className="glass p-8 text-lg font-semibold">
        {labels.success}
      </p>
    );
  }

  return (
    <form action={action} className="glass grid gap-4 p-6 sm:grid-cols-2 sm:p-8" noValidate={false}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="product" value={product} />
      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold">
        {labels.name}
        <input className={field} name="name" required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        {labels.company}
        <input className={field} name="company" maxLength={160} autoComplete="organization" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        {labels.phone}
        <input className={field} name="phone" type="tel" maxLength={40} autoComplete="tel" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        {labels.email}
        <input className={field} name="email" type="email" maxLength={160} autoComplete="email" />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">
        {labels.message}
        <textarea
          className={`${field} min-h-32 resize-y`}
          name="message"
          required
          minLength={5}
          maxLength={4000}
          defaultValue={defaultMessage}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? labels.sending : labels.send}
        </button>
        {(state.status === "invalid" || state.status === "error") && (
          <p role="alert" className="text-sm font-semibold text-white">
            {labels.error}
          </p>
        )}
        {state.status === "limited" && (
          <p role="alert" className="text-sm font-semibold text-white">
            {labels.tooMany}
          </p>
        )}
      </div>
    </form>
  );
}

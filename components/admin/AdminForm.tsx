"use client";

import { useActionState, useState } from "react";
import type { Field, Option } from "@/lib/admin/resources";
import type { FormState } from "@/lib/admin/actions";

type ResolvedField = Field & { options?: Option[] };
type Values = Record<string, unknown>;

const LOCALES = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
] as const;

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25";

function l10nValue(values: Values, name: string, code: string): string {
  const group = values[name] as Record<string, string> | undefined;
  return group?.[code] ?? "";
}

export function AdminForm({
  fields,
  values,
  action,
  submitLabel,
}: {
  fields: ResolvedField[];
  values: Values;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const [tab, setTab] = useState<(typeof LOCALES)[number]["code"]>("az");
  const hasL10n = fields.some((f) => f.type.startsWith("l10n"));

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      {hasL10n && (
        <div role="tablist" aria-label="Dil" className="sticky top-0 z-10 -mx-1 flex gap-2 bg-slate-50/95 px-1 py-3 backdrop-blur">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              role="tab"
              aria-selected={tab === l.code}
              onClick={() => setTab(l.code)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                tab === l.code ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </button>
          ))}
          <span className="ml-2 self-center text-xs text-slate-500">Dil tabları bütün tərcümə sahələrinə aiddir. AZ məcburidir.</span>
        </div>
      )}

      {fields.map((field) => {
        const id = `f-${field.name}`;
        const label = (
          <span className="mb-1.5 block text-sm font-semibold text-slate-800">
            {field.label}
            {field.hint && <span className="ml-2 font-normal text-slate-500">{field.hint}</span>}
          </span>
        );

        switch (field.type) {
          case "l10n":
          case "l10n-textarea":
          case "l10n-lines":
            return (
              <div key={field.name}>
                <label htmlFor={`${id}-${tab}`}>{label}</label>
                {LOCALES.map((l) => {
                  const common = {
                    id: `${id}-${l.code}`,
                    name: `${field.name}.${l.code}`,
                    defaultValue: l10nValue(values, field.name, l.code),
                    className: input,
                    hidden: tab !== l.code,
                    lang: l.code,
                    placeholder: l.code === "az" ? "" : `${l.label} (boş qalsa AZ göstərilir)`,
                  };
                  return field.type === "l10n" ? (
                    <input key={l.code} {...common} />
                  ) : (
                    <textarea key={l.code} {...common} rows={field.type === "l10n-lines" ? 5 : 6} />
                  );
                })}
              </div>
            );
          case "textarea":
            return (
              <div key={field.name}>
                <label htmlFor={id}>{label}</label>
                <textarea id={id} name={field.name} rows={5} defaultValue={String(values[field.name] ?? "")} className={input} />
              </div>
            );
          case "checkbox":
            return (
              <label key={field.name} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={Boolean(values[field.name])}
                  className="size-4 accent-emerald-600"
                />
                {field.label}
              </label>
            );
          case "select":
            return (
              <div key={field.name}>
                <label htmlFor={id}>{label}</label>
                <select id={id} name={field.name} defaultValue={String(values[field.name] ?? "")} className={input}>
                  {field.name === "category" && <option value="">Kateqoriyasız</option>}
                  {(field.options ?? []).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          case "image": {
            const current = String(values[field.name] ?? "");
            return (
              <fieldset key={field.name} className="rounded-lg border border-slate-300 bg-white p-4">
                <legend className="px-1 text-sm font-semibold text-slate-800">{field.label}</legend>
                {current && (
                  <div className="mb-3 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/media/${current}`} alt="" className="h-20 w-32 rounded-md border border-slate-200 bg-slate-100 object-contain" />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" name={`${field.name}__remove`} className="size-4 accent-red-600" />
                      Şəkli sil
                    </label>
                  </div>
                )}
                <input
                  type="file"
                  name={`${field.name}__file`}
                  accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                  className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                {field.hint && <p className="mt-2 text-xs text-slate-500">{field.hint}</p>}
              </fieldset>
            );
          }
          default:
            return (
              <div key={field.name}>
                <label htmlFor={id}>{label}</label>
                <input
                  id={id}
                  name={field.name}
                  type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
                  defaultValue={String(values[field.name] ?? "")}
                  className={input}
                />
              </div>
            );
        }
      })}

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-emerald-600 px-7 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Yadda saxlanılır..." : submitLabel}
      </button>
    </form>
  );
}

import type { Metadata } from "next";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteLead, setLeadRead } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";

export const metadata: Metadata = { title: "Müraciətlər" };

type LeadRow = {
  _id: unknown;
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  locale: string;
  page: string;
  product: string;
  telegram: string;
  read: boolean;
  createdAt: Date;
};

export default async function LeadsPage() {
  await requireAdmin();
  await connectDB();
  const leads = await Lead.find().sort({ createdAt: -1 }).limit(200).lean<LeadRow[]>();

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Müraciətlər</h1>
      {leads.length === 0 && <p className="rounded-2xl bg-white p-8 text-sm text-slate-500 ring-1 ring-slate-200">Hələ müraciət yoxdur.</p>}
      <ul className="space-y-3">
        {leads.map((l) => {
          const id = String(l._id);
          return (
            <li key={id} className={`space-y-3 rounded-2xl bg-white p-5 ring-1 ${l.read ? "ring-slate-200" : "ring-emerald-500"}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-bold">
                  {l.name}
                  {l.company && <span className="ml-2 font-normal text-slate-500">{l.company}</span>}
                </p>
                <time dateTime={new Date(l.createdAt).toISOString()} className="text-xs text-slate-500">
                  {new Date(l.createdAt).toLocaleString("az-AZ")} · {l.locale.toUpperCase()}
                </time>
              </div>
              {l.product && <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Məhsul: {l.product}</p>}
              <p className="whitespace-pre-wrap text-sm text-slate-700">{l.message}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {l.phone && (
                  <a href={`tel:${l.phone.replace(/[^+\d]/g, "")}`} className="font-semibold text-emerald-700 hover:underline">
                    {l.phone}
                  </a>
                )}
                {l.email && (
                  <a href={`mailto:${l.email}`} className="font-semibold text-emerald-700 hover:underline">
                    {l.email}
                  </a>
                )}
                {l.telegram === "failed" && <span className="text-xs font-semibold text-red-600">Telegram göndərilmədi</span>}
                {l.telegram === "partial" && <span className="text-xs font-semibold text-amber-600">Telegram: bəzi alıcılara getmədi</span>}
                <span className="ml-auto flex gap-4">
                  <form action={setLeadRead.bind(null, id, !l.read)}>
                    <button type="submit" className="font-semibold text-slate-700 hover:underline">
                      {l.read ? "Oxunmamış et" : "Oxunmuş et"}
                    </button>
                  </form>
                  <form action={deleteLead.bind(null, id)}>
                    <ConfirmButton message="Müraciət silinsin?" className="font-semibold text-red-600 hover:underline">
                      Sil
                    </ConfirmButton>
                  </form>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

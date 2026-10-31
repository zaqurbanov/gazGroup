import type { Metadata } from "next";
import Link from "next/link";
import { modelFor, resources } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";

export const metadata: Metadata = { title: "Panel" };

export default async function DashboardPage() {
  await requireAdmin();
  await connectDB();

  const [counts, unread, latest] = await Promise.all([
    Promise.all(resources.map(async (r) => ({ ...r, count: await modelFor[r.key].countDocuments() }))),
    Lead.countDocuments({ read: false }),
    Lead.find().sort({ createdAt: -1 }).limit(5).lean<{ _id: unknown; name: string; message: string; createdAt: Date; read: boolean }[]>(),
  ]);

  return (
    <div className="max-w-5xl space-y-10">
      <h1 className="text-2xl font-bold">Panel</h1>

      <section aria-label="Statistika" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/leads" className="rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-3xl font-bold">{unread}</p>
          <p className="mt-1 text-sm text-white/70">Oxunmamış müraciət</p>
        </Link>
        {counts.map((c) => (
          <Link key={c.key} href={`/admin/${c.key}`} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 hover:ring-emerald-600">
            <p className="text-3xl font-bold">{c.count}</p>
            <p className="mt-1 text-sm text-slate-600">{c.label}</p>
          </Link>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Son müraciətlər</h2>
        {latest.length === 0 ? (
          <p className="text-sm text-slate-500">Hələ müraciət yoxdur.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
            {latest.map((l) => (
              <li key={String(l._id)} className="flex items-start gap-3 p-4">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${l.read ? "bg-slate-300" : "bg-emerald-600"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{l.name}</p>
                  <p className="truncate text-sm text-slate-600">{l.message}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { deleteResource } from "@/lib/admin/actions";
import { getPath, getSpec, modelFor } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export async function generateMetadata({ params }: PageProps<"/admin/[resource]">): Promise<Metadata> {
  const spec = getSpec((await params).resource);
  return { title: spec?.label ?? "Admin" };
}

export default async function ResourceListPage({ params }: PageProps<"/admin/[resource]">) {
  await requireAdmin();
  const spec = getSpec((await params).resource);
  if (!spec) notFound();

  await connectDB();
  const docs = await modelFor[spec.key].find().sort({ order: 1, createdAt: 1 }).lean<Record<string, unknown>[]>();

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{spec.label}</h1>
        <Link href={`/admin/${spec.key}/new`} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
          + Yeni {spec.singular}
        </Link>
      </div>

      {docs.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-sm text-slate-500 ring-1 ring-slate-200">Hələ heç nə əlavə olunmayıb.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Sıra</th>
                {spec.columns.map((c) => (
                  <th key={c.path} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((d) => {
                const id = String(d._id);
                return (
                  <tr key={id}>
                    <td className="px-4 py-3 text-slate-500">{String(d.order ?? 0)}</td>
                    {spec.columns.map((c, i) => (
                      <td key={c.path} className="px-4 py-3">
                        {i === 0 ? (
                          <Link href={`/admin/${spec.key}/${id}`} className="font-semibold hover:text-emerald-700">
                            {getPath(d, c.path) || "(adsız)"}
                          </Link>
                        ) : (
                          getPath(d, c.path)
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${d.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                        {d.published ? "Aktiv" : "Gizli"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/${spec.key}/${id}`} className="font-semibold text-slate-700 hover:underline">
                          Redaktə
                        </Link>
                        <form action={deleteResource.bind(null, spec.key, id)}>
                          <ConfirmButton message={`Bu ${spec.singular} silinsin?`} className="font-semibold text-red-600 hover:underline">
                            Sil
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

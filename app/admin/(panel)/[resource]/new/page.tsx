import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { saveResource } from "@/lib/admin/actions";
import { emptyValues, resolveFields } from "@/lib/admin/form-data";
import { getSpec } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Yeni qeyd" };

export default async function NewResourcePage({ params }: PageProps<"/admin/[resource]/new">) {
  await requireAdmin();
  const spec = getSpec((await params).resource);
  if (!spec) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/admin/${spec.key}`} className="text-sm font-semibold text-slate-600 hover:underline">
        ← {spec.label}
      </Link>
      <h1 className="text-2xl font-bold">Yeni {spec.singular}</h1>
      <AdminForm
        fields={await resolveFields(spec)}
        values={emptyValues(spec)}
        action={saveResource.bind(null, spec.key, null)}
        submitLabel="Yarat"
      />
    </div>
  );
}

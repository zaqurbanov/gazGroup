import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { AdminForm } from "@/components/admin/AdminForm";
import { saveResource } from "@/lib/admin/actions";
import { plainValues, resolveFields } from "@/lib/admin/form-data";
import { getSpec, modelFor } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export const metadata: Metadata = { title: "Redaktə" };

export default async function EditResourcePage({ params }: PageProps<"/admin/[resource]/[id]">) {
  await requireAdmin();
  const { resource, id } = await params;
  const spec = getSpec(resource);
  if (!spec || !mongoose.isValidObjectId(id)) notFound();

  await connectDB();
  const doc = await modelFor[spec.key].findById(id).lean();
  if (!doc) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/admin/${spec.key}`} className="text-sm font-semibold text-slate-600 hover:underline">
        ← {spec.label}
      </Link>
      <h1 className="text-2xl font-bold">Redaktə: {spec.singular}</h1>
      <AdminForm
        fields={await resolveFields(spec)}
        values={plainValues(doc)}
        action={saveResource.bind(null, spec.key, id)}
        submitLabel="Yadda saxla"
      />
    </div>
  );
}

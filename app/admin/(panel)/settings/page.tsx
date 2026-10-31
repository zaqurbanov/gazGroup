import type { Metadata } from "next";
import { AdminForm } from "@/components/admin/AdminForm";
import { saveResource } from "@/lib/admin/actions";
import { plainValues } from "@/lib/admin/form-data";
import { settingsSpec } from "@/lib/admin/resources";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models";

export const metadata: Metadata = { title: "Tənzimləmələr" };

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  await requireAdmin();
  const { saved } = await searchParams;

  await connectDB();
  const doc = (await SiteSettings.findOne({ key: "main" }).lean()) ?? new SiteSettings({ key: "main" }).toObject();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Tənzimləmələr</h1>
      {saved && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
          Yadda saxlanıldı.
        </p>
      )}
      <AdminForm
        fields={settingsSpec.fields}
        values={plainValues(doc)}
        action={saveResource.bind(null, "settings", null)}
        submitLabel="Yadda saxla"
      />
    </div>
  );
}

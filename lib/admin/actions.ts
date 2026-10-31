"use server";

import bcrypt from "bcryptjs";
import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { deleteMedia, saveUpload } from "@/lib/media";
import { rateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/slug";
import { AdminUser, Lead } from "@/models";
import { getSpec, modelFor, settingsSpec, type Field, type ResourceSpec } from "./resources";

export type FormState = { error?: string };

const LOCALES = ["az", "en", "ru"] as const;
// Compared against when the email is unknown, so response time does not reveal valid accounts.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return { error: "Çox cəhd edildi. 15 dəqiqə sonra yenidən yoxlayın." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "E-poçt və parol daxil edin." };

  await connectDB();
  const user = await AdminUser.findOne({ email }).lean<{ _id: unknown; email: string; passwordHash: string }>();
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) return { error: "E-poçt və ya parol yanlışdır." };

  await createSession(String(user._id), user.email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

async function readFields(spec: ResourceSpec, formData: FormData, existing: Record<string, unknown> | null) {
  const doc: Record<string, unknown> = {};
  const staleMedia: string[] = [];

  for (const field of spec.fields as Field[]) {
    const { name } = field;
    switch (field.type) {
      case "checkbox":
        doc[name] = formData.has(name);
        break;
      case "number":
        doc[name] = Number(formData.get(name) ?? 0) || 0;
        break;
      case "l10n":
      case "l10n-textarea":
      case "l10n-lines":
        doc[name] = Object.fromEntries(LOCALES.map((l) => [l, String(formData.get(`${name}.${l}`) ?? "").trim()]));
        break;
      case "image": {
        const previous = String(existing?.[name] ?? "");
        const file = formData.get(`${name}__file`);
        if (file instanceof File && file.size > 0) {
          doc[name] = await saveUpload(file);
          if (previous) staleMedia.push(previous);
        } else if (formData.has(`${name}__remove`)) {
          doc[name] = "";
          if (previous) staleMedia.push(previous);
        } else {
          doc[name] = previous;
        }
        break;
      }
      default:
        doc[name] = String(formData.get(name) ?? "").trim();
    }
  }
  return { doc, staleMedia };
}

export async function saveResource(key: string, id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const spec = key === "settings" ? settingsSpec : getSpec(key);
  const Model = modelFor[key];
  if (!spec || !Model) return { error: "Naməlum bölmə." };

  await connectDB();
  const existing = id ? await Model.findById(id).lean<Record<string, unknown>>() : null;
  if (id && !existing) return { error: "Qeyd tapılmadı." };

  let result: Awaited<ReturnType<typeof readFields>>;
  try {
    result = await readFields(spec, formData, existing);
  } catch (error) {
    return { error: error instanceof Error ? `Şəkil yüklənmədi: ${error.message}` : "Şəkil yüklənmədi." };
  }
  const { doc, staleMedia } = result;

  if (spec.slugFrom) {
    const source = (doc[spec.slugFrom] as { az?: string } | undefined)?.az ?? "";
    const slug = slugify(String(doc.slug || source));
    if (!slug) return { error: "Slug yaratmaq üçün Azərbaycan dilində ad daxil edin." };
    doc.slug = slug;
  }
  const requiredL10n = spec.fields.find((f) => f.type === "l10n");
  if (requiredL10n && !(doc[requiredL10n.name] as { az?: string }).az) {
    return { error: `"${requiredL10n.label}" sahəsi Azərbaycan dilində doldurulmalıdır.` };
  }
  if (key === "partners" && !doc.name) return { error: "Ad daxil edin." };

  try {
    if (key === "settings") await Model.updateOne({ key: "main" }, { $set: doc }, { upsert: true });
    else if (id) await Model.updateOne({ _id: id }, { $set: doc });
    else await Model.create(doc);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return { error: "Bu slug artıq istifadə olunur. Başqa slug yazın." };
    console.error("admin save failed", error);
    return { error: "Yadda saxlamaq mümkün olmadı." };
  }

  await Promise.all(staleMedia.map(deleteMedia));
  updateTag(spec.tag);
  redirect(key === "settings" ? "/admin/settings?saved=1" : `/admin/${key}`);
}

export async function deleteResource(key: string, id: string) {
  await requireAdmin();
  const spec = getSpec(key);
  const Model = modelFor[key];
  if (!spec || !Model) return;

  await connectDB();
  const doc = await Model.findById(id).lean<Record<string, unknown>>();
  if (!doc) return;
  for (const f of spec.fields) if (f.type === "image" && doc[f.name]) await deleteMedia(String(doc[f.name]));
  await Model.deleteOne({ _id: id });
  updateTag(spec.tag);
  redirect(`/admin/${key}`);
}

export async function setLeadRead(id: string, read: boolean) {
  await requireAdmin();
  await connectDB();
  await Lead.updateOne({ _id: id }, { $set: { read } });
  redirect("/admin/leads");
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await connectDB();
  await Lead.deleteOne({ _id: id });
  redirect("/admin/leads");
}

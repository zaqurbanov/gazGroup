import "server-only";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";
import type { Field, Option, ResourceSpec } from "./resources";

/** Fills in options that come from the database so the client form only receives plain data. */
export async function resolveFields(spec: ResourceSpec): Promise<(Field & { options?: Option[] })[]> {
  const needsCategories = spec.fields.some((f) => f.type === "select" && f.optionsFrom === "categories");
  let categories: Option[] = [];
  if (needsCategories) {
    await connectDB();
    const docs = await Category.find().sort({ order: 1 }).lean<{ slug: string; title: { az: string } }[]>();
    categories = docs.map((c) => ({ value: c.slug, label: c.title.az }));
  }
  return spec.fields.map((f) =>
    f.type === "select" && f.optionsFrom === "categories" ? { ...f, options: categories } : f,
  );
}

export const emptyValues = (spec: ResourceSpec): Record<string, unknown> => {
  const values: Record<string, unknown> = {};
  for (const f of spec.fields) {
    if (f.name === "published" || f.name === "showInStock") values[f.name] = true;
    else if (f.name === "order") values[f.name] = 0;
    else if (f.type === "select") values[f.name] = f.options?.[0]?.value ?? "";
  }
  return values;
};

export const plainValues = (doc: unknown) => JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;

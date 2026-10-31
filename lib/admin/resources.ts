import type { Model } from "mongoose";
import { Category, Certificate, Faq, Partner, Product, Project, Service, SiteSettings } from "@/models";

export type Option = { value: string; label: string };

export type Field =
  | { name: string; label: string; type: "text" | "textarea" | "number" | "url" | "checkbox"; hint?: string }
  | { name: string; label: string; type: "select"; options?: Option[]; optionsFrom?: "categories"; hint?: string }
  | { name: string; label: string; type: "image"; hint?: string }
  | { name: string; label: string; type: "l10n" | "l10n-textarea" | "l10n-lines"; hint?: string };

export type Column = { path: string; label: string };

export type ResourceSpec = {
  key: string;
  label: string;
  singular: string;
  tag: string;
  fields: Field[];
  columns: Column[];
  /** Field whose Azerbaijani value is used to build a slug when the slug is left empty. */
  slugFrom?: string;
  /** Public path (without locale) used for the "view" link. */
  publicPath?: string;
};

const seo: Field[] = [
  { name: "seoTitle", label: "SEO başlıq", type: "l10n", hint: "Boş qalsa məhsul/səhifə adı istifadə olunur" },
  { name: "seoDescription", label: "SEO təsvir", type: "l10n-textarea", hint: "150-160 simvol tövsiyə olunur" },
];
const common: Field[] = [
  { name: "order", label: "Sıra", type: "number", hint: "Kiçik rəqəm əvvəldə görünür" },
  { name: "published", label: "Saytda göstər", type: "checkbox" },
];

export const resources: ResourceSpec[] = [
  {
    key: "products",
    label: "Məhsullar",
    singular: "məhsul",
    tag: "products",
    slugFrom: "name",
    publicPath: "/products",
    columns: [
      { path: "name.az", label: "Ad" },
      { path: "formula", label: "Formula" },
      { path: "stockStatus", label: "Stok" },
    ],
    fields: [
      { name: "name", label: "Ad", type: "l10n" },
      { name: "slug", label: "Slug (URL)", type: "text", hint: "Boş qalsa addan avtomatik yaranır" },
      { name: "formula", label: "Formula", type: "text" },
      { name: "purity", label: "Təmizlik dərəcəsi", type: "text", hint: "Məs: 99.5%" },
      { name: "category", label: "Kateqoriya", type: "select", optionsFrom: "categories" },
      { name: "summary", label: "Qısa təsvir", type: "l10n-textarea" },
      { name: "description", label: "Ətraflı təsvir", type: "l10n-textarea", hint: "Abzasları boş sətirlə ayırın" },
      { name: "applications", label: "Tətbiq sahələri", type: "l10n-lines", hint: "Hər sətirdə bir tətbiq" },
      {
        name: "stockStatus",
        label: "Stok statusu",
        type: "select",
        options: [
          { value: "in_stock", label: "Stokda" },
          { value: "limited", label: "Məhdud" },
          { value: "on_request", label: "Sifarişlə" },
        ],
      },
      { name: "showInStock", label: "Stok siyahısında göstər", type: "checkbox" },
      { name: "image", label: "Şəkil", type: "image" },
      ...seo,
      ...common,
    ],
  },
  {
    key: "categories",
    label: "Kateqoriyalar",
    singular: "kateqoriya",
    tag: "categories",
    slugFrom: "title",
    columns: [
      { path: "title.az", label: "Ad" },
      { path: "slug", label: "Slug" },
    ],
    fields: [
      { name: "title", label: "Ad", type: "l10n" },
      { name: "slug", label: "Slug (URL)", type: "text" },
      { name: "description", label: "Təsvir", type: "l10n-textarea" },
      ...common,
    ],
  },
  {
    key: "services",
    label: "Xidmətlər",
    singular: "xidmət",
    tag: "services",
    slugFrom: "title",
    publicPath: "/services",
    columns: [{ path: "title.az", label: "Ad" }],
    fields: [
      { name: "title", label: "Ad", type: "l10n" },
      { name: "slug", label: "Slug (URL)", type: "text" },
      { name: "summary", label: "Qısa təsvir", type: "l10n-textarea" },
      { name: "description", label: "Ətraflı təsvir", type: "l10n-textarea" },
      { name: "image", label: "Şəkil", type: "image" },
      ...seo,
      ...common,
    ],
  },
  {
    key: "projects",
    label: "Layihələr",
    singular: "layihə",
    tag: "projects",
    slugFrom: "title",
    publicPath: "/projects",
    columns: [
      { path: "title.az", label: "Ad" },
      { path: "client", label: "Müştəri" },
      { path: "year", label: "İl" },
    ],
    fields: [
      { name: "title", label: "Ad", type: "l10n" },
      { name: "slug", label: "Slug (URL)", type: "text" },
      { name: "client", label: "Müştəri", type: "text" },
      { name: "year", label: "İl", type: "text" },
      { name: "summary", label: "Qısa təsvir", type: "l10n-textarea" },
      { name: "description", label: "Ətraflı təsvir", type: "l10n-textarea" },
      { name: "image", label: "Şəkil", type: "image" },
      ...seo,
      ...common,
    ],
  },
  {
    key: "partners",
    label: "Müştərilər və tərəfdaşlar",
    singular: "qeyd",
    tag: "partners",
    columns: [
      { path: "name", label: "Ad" },
      { path: "kind", label: "Növ" },
    ],
    fields: [
      { name: "name", label: "Ad", type: "text" },
      {
        name: "kind",
        label: "Növ",
        type: "select",
        options: [
          { value: "client", label: "Müştəri" },
          { value: "partner", label: "Tərəfdaş" },
        ],
      },
      { name: "logo", label: "Loqo", type: "image" },
      { name: "url", label: "Sayt (ixtiyari)", type: "url" },
      ...common,
    ],
  },
  {
    key: "certificates",
    label: "Sertifikatlar",
    singular: "sertifikat",
    tag: "certificates",
    columns: [{ path: "title.az", label: "Ad" }],
    fields: [
      { name: "title", label: "Ad", type: "l10n" },
      { name: "description", label: "Təsvir", type: "l10n-textarea" },
      { name: "image", label: "Şəkil / skan", type: "image" },
      ...common,
    ],
  },
  {
    key: "faqs",
    label: "Suallar (FAQ)",
    singular: "sual",
    tag: "faqs",
    columns: [{ path: "question.az", label: "Sual" }],
    fields: [
      { name: "question", label: "Sual", type: "l10n" },
      { name: "answer", label: "Cavab", type: "l10n-textarea" },
      ...common,
    ],
  },
];

export const settingsSpec: ResourceSpec = {
  key: "settings",
  label: "Tənzimləmələr",
  singular: "tənzimləmə",
  tag: "settings",
  columns: [],
  fields: [
    { name: "siteName", label: "Sayt / şirkət adı", type: "text" },
    { name: "logo", label: "Loqo", type: "image", hint: "SVG, PNG, WebP. Maks 4 MB" },
    { name: "phone", label: "Telefon", type: "text" },
    { name: "email", label: "E-poçt", type: "text" },
    { name: "whatsapp", label: "WhatsApp nömrəsi", type: "text", hint: "Beynəlxalq formatda, məs: +994501234567" },
    { name: "address", label: "Ünvan", type: "l10n" },
    { name: "hours", label: "İş saatları", type: "l10n" },
    { name: "instagram", label: "Instagram linki", type: "url" },
    { name: "facebook", label: "Facebook linki", type: "url" },
    { name: "linkedin", label: "LinkedIn linki", type: "url" },
    { name: "statYears", label: "Rəqəm: illik təcrübə", type: "text", hint: "Boş qalsa saytda göstərilmir" },
    { name: "statClients", label: "Rəqəm: müştəri sayı", type: "text" },
    { name: "statProducts", label: "Rəqəm: məhsul sayı", type: "text" },
    { name: "statProjects", label: "Rəqəm: layihə sayı", type: "text" },
    { name: "seoTitle", label: "Ana səhifə SEO başlıq", type: "l10n" },
    { name: "seoDescription", label: "Ana səhifə SEO təsvir", type: "l10n-textarea" },
  ],
};

export const getSpec = (key: string) => resources.find((r) => r.key === key);

type AnyModel = Model<Record<string, unknown>>;
export const modelFor: Record<string, AnyModel> = {
  products: Product as unknown as AnyModel,
  categories: Category as unknown as AnyModel,
  services: Service as unknown as AnyModel,
  projects: Project as unknown as AnyModel,
  partners: Partner as unknown as AnyModel,
  certificates: Certificate as unknown as AnyModel,
  faqs: Faq as unknown as AnyModel,
  settings: SiteSettings as unknown as AnyModel,
};

export function getPath(obj: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], obj);
  return value === undefined || value === null ? "" : String(value);
}

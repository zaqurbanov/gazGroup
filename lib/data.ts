import { cacheLife, cacheTag } from "next/cache";
import { connectDB } from "./db";
import type { L10n } from "./i18n";
import {
  Category,
  Certificate,
  Faq,
  Partner,
  Product,
  Project,
  Service,
  SiteSettings,
} from "@/models";

export type StockStatus = "in_stock" | "limited" | "on_request";

export type CategoryDTO = { _id: string; slug: string; title: L10n; description: L10n };
export type ProductDTO = {
  _id: string;
  slug: string;
  name: L10n;
  formula: string;
  purity: string;
  category: string;
  summary: L10n;
  description: L10n;
  applications: L10n;
  stockStatus: StockStatus;
  showInStock: boolean;
  image: string;
  seoTitle: L10n;
  seoDescription: L10n;
  updatedAt: string;
};
export type ServiceDTO = {
  _id: string;
  slug: string;
  title: L10n;
  summary: L10n;
  description: L10n;
  image: string;
  seoTitle: L10n;
  seoDescription: L10n;
  updatedAt: string;
};
export type ProjectDTO = {
  _id: string;
  slug: string;
  title: L10n;
  summary: L10n;
  description: L10n;
  client: string;
  year: string;
  image: string;
  seoTitle: L10n;
  seoDescription: L10n;
  updatedAt: string;
};
export type PartnerDTO = { _id: string; name: string; kind: "client" | "partner"; logo: string; url: string };
export type CertificateDTO = { _id: string; title: L10n; description: L10n; image: string };
export type FaqDTO = { _id: string; question: L10n; answer: L10n };
export type SettingsDTO = {
  siteName: string;
  logo: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: L10n;
  hours: L10n;
  instagram: string;
  facebook: string;
  linkedin: string;
  statYears: string;
  statClients: string;
  statProducts: string;
  statProjects: string;
  seoTitle: L10n;
  seoDescription: L10n;
};

/** Cached functions must return serializable data, so Mongoose documents are flattened to plain JSON. */
const plain = <T>(value: unknown): T => JSON.parse(JSON.stringify(value)) as T;

const sorted = { order: 1, createdAt: 1 } as const;

export async function getSettings(): Promise<SettingsDTO> {
  "use cache";
  cacheLife("max");
  cacheTag("settings");
  await connectDB();
  const doc = await SiteSettings.findOne({ key: "main" }).lean();
  return plain<SettingsDTO>(doc ?? new SiteSettings({ key: "main" }).toObject());
}

export async function getCategories(): Promise<CategoryDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("categories");
  await connectDB();
  return plain(await Category.find({ published: true }).sort(sorted).lean());
}

export async function getProducts(): Promise<ProductDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("products");
  await connectDB();
  return plain(await Product.find({ published: true }).sort(sorted).lean());
}

export async function getProduct(slug: string): Promise<ProductDTO | null> {
  "use cache";
  cacheLife("max");
  cacheTag("products");
  await connectDB();
  return plain(await Product.findOne({ slug, published: true }).lean());
}

export async function getServices(): Promise<ServiceDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("services");
  await connectDB();
  return plain(await Service.find({ published: true }).sort(sorted).lean());
}

export async function getService(slug: string): Promise<ServiceDTO | null> {
  "use cache";
  cacheLife("max");
  cacheTag("services");
  await connectDB();
  return plain(await Service.findOne({ slug, published: true }).lean());
}

export async function getProjects(): Promise<ProjectDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("projects");
  await connectDB();
  return plain(await Project.find({ published: true }).sort(sorted).lean());
}

export async function getProject(slug: string): Promise<ProjectDTO | null> {
  "use cache";
  cacheLife("max");
  cacheTag("projects");
  await connectDB();
  return plain(await Project.findOne({ slug, published: true }).lean());
}

export async function getPartners(): Promise<PartnerDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("partners");
  await connectDB();
  return plain(await Partner.find({ published: true }).sort(sorted).lean());
}

export async function getCertificates(): Promise<CertificateDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("certificates");
  await connectDB();
  return plain(await Certificate.find({ published: true }).sort(sorted).lean());
}

export async function getFaqs(): Promise<FaqDTO[]> {
  "use cache";
  cacheLife("max");
  cacheTag("faqs");
  await connectDB();
  return plain(await Faq.find({ published: true }).sort(sorted).lean());
}

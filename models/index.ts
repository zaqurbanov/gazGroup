import mongoose, { Schema, type Model } from "mongoose";

const l10n = { az: { type: String, default: "" }, en: { type: String, default: "" }, ru: { type: String, default: "" } };
const base = { order: { type: Number, default: 0 }, published: { type: Boolean, default: true } };
const opts = { timestamps: true };

function define<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const Category = define(
  "Category",
  new Schema(
    {
      slug: { type: String, required: true, unique: true },
      title: l10n,
      description: l10n,
      ...base,
    },
    opts,
  ),
);

export const Product = define(
  "Product",
  new Schema(
    {
      slug: { type: String, required: true, unique: true },
      name: l10n,
      formula: { type: String, default: "" },
      purity: { type: String, default: "" },
      category: { type: String, default: "" },
      summary: l10n,
      description: l10n,
      applications: l10n,
      stockStatus: { type: String, enum: ["in_stock", "limited", "on_request"], default: "on_request" },
      showInStock: { type: Boolean, default: true },
      image: { type: String, default: "" },
      seoTitle: l10n,
      seoDescription: l10n,
      ...base,
    },
    opts,
  ),
);

export const Service = define(
  "Service",
  new Schema(
    {
      slug: { type: String, required: true, unique: true },
      title: l10n,
      summary: l10n,
      description: l10n,
      image: { type: String, default: "" },
      seoTitle: l10n,
      seoDescription: l10n,
      ...base,
    },
    opts,
  ),
);

export const Project = define(
  "Project",
  new Schema(
    {
      slug: { type: String, required: true, unique: true },
      title: l10n,
      summary: l10n,
      description: l10n,
      client: { type: String, default: "" },
      year: { type: String, default: "" },
      image: { type: String, default: "" },
      seoTitle: l10n,
      seoDescription: l10n,
      ...base,
    },
    opts,
  ),
);

export const Partner = define(
  "Partner",
  new Schema(
    {
      name: { type: String, required: true },
      kind: { type: String, enum: ["client", "partner"], default: "client" },
      logo: { type: String, default: "" },
      url: { type: String, default: "" },
      ...base,
    },
    opts,
  ),
);

export const Certificate = define(
  "Certificate",
  new Schema(
    {
      title: l10n,
      description: l10n,
      image: { type: String, default: "" },
      ...base,
    },
    opts,
  ),
);

export const Faq = define(
  "Faq",
  new Schema(
    {
      question: l10n,
      answer: l10n,
      ...base,
    },
    opts,
  ),
);

export const Lead = define(
  "Lead",
  new Schema(
    {
      name: String,
      company: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      message: String,
      locale: { type: String, default: "az" },
      page: { type: String, default: "" },
      product: { type: String, default: "" },
      telegram: { type: String, enum: ["pending", "sent", "partial", "failed", "disabled"], default: "pending" },
      read: { type: Boolean, default: false },
    },
    opts,
  ),
);

export const AdminUser = define(
  "AdminUser",
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true },
      passwordHash: { type: String, required: true },
    },
    opts,
  ),
);

export const SiteSettings = define(
  "SiteSettings",
  new Schema(
    {
      key: { type: String, default: "main", unique: true },
      siteName: { type: String, default: "Caspian Gaz Group" },
      logo: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      whatsapp: { type: String, default: "" },
      address: l10n,
      hours: l10n,
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      statYears: { type: String, default: "" },
      statClients: { type: String, default: "" },
      statProducts: { type: String, default: "" },
      statProjects: { type: String, default: "" },
      seoTitle: l10n,
      seoDescription: l10n,
    },
    opts,
  ),
);

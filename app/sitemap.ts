import type { MetadataRoute } from "next";
import { getProducts, getProjects, getServices } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { abs } from "@/lib/seo";

const staticPaths = ["", "/about", "/products", "/services", "/projects", "/faq", "/contact"];

function entries(path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: abs(`/${locale}${path}`),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency: "weekly",
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, abs(`/${l}${path}`)])) },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services, projects] = await Promise.all([getProducts(), getServices(), getProjects()]);

  return [
    ...staticPaths
      .filter((p) => p !== "/projects" || projects.length > 0)
      .flatMap((p) => entries(p, undefined, p === "" ? 1 : 0.8)),
    ...products.flatMap((p) => entries(`/products/${p.slug}`, p.updatedAt)),
    ...services.flatMap((s) => entries(`/services/${s.slug}`, s.updatedAt)),
    ...projects.flatMap((p) => entries(`/projects/${p.slug}`, p.updatedAt)),
  ];
}

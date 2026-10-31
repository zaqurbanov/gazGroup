import type { MetadataRoute } from "next";
import { getProducts, getProjects, getServices } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { abs } from "@/lib/seo";

const staticPaths = ["", "/about", "/products", "/services", "/projects", "/faq", "/contact"];

function entry(path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] {
  return {
    url: abs(`/az${path}`),
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency: "weekly",
    priority,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, abs(`/${l}${path}`)])) },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services, projects] = await Promise.all([getProducts(), getServices(), getProjects()]);

  const entries = [
    ...staticPaths.map((p) => entry(p, undefined, p === "" ? 1 : 0.8)),
    ...products.map((p) => entry(`/products/${p.slug}`, p.updatedAt)),
    ...services.map((s) => entry(`/services/${s.slug}`, s.updatedAt)),
    ...projects.map((p) => entry(`/projects/${p.slug}`, p.updatedAt)),
  ];

  // One entry per locale URL, each pointing at all alternates.
  return entries.flatMap((e) =>
    locales.map((l) => ({ ...e, url: e.url.replace("/az", `/${l}`) })),
  );
}

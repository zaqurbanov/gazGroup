"use server";

import { headers } from "next/headers";
import { getProduct } from "@/lib/data";
import { connectDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { abs } from "@/lib/seo";
import { formatLeadMessage, sendTelegramHtml } from "@/lib/telegram";
import { leadSchema } from "@/lib/validators";
import { Lead } from "@/models";

export type LeadState = { status: "idle" | "ok" | "invalid" | "limited" | "error" };

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Honeypot: real visitors never fill this hidden field. Bots get a fake success.
  if (String(formData.get("website") ?? "") !== "") return { status: "ok" };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  if (!rateLimit(`lead:${ip}`, 5, 10 * 60 * 1000)) return { status: "limited" };

  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "invalid" };

  let lead;
  try {
    await connectDB();
    lead = await Lead.create(parsed.data);
  } catch (error) {
    console.error("lead save failed", error);
    return { status: "error" };
  }

  // The lead is already saved, so a Telegram outage never loses an order or fails the form.
  try {
    const product = parsed.data.product ? await getProduct(parsed.data.product) : null;
    const result = await sendTelegramHtml(
      formatLeadMessage({
        ...parsed.data,
        product: product && { name: product.name.az, formula: product.formula, slug: product.slug },
        createdAt: new Date(),
      }),
      { buttonUrl: abs("/admin/leads"), buttonText: "Admində aç" },
    );
    await Lead.updateOne({ _id: lead._id }, { $set: { telegram: !result.ok ? result.reason : result.sent === result.total ? "sent" : result.sent === 0 ? "failed" : "partial" } });
  } catch (error) {
    console.error("lead notification failed", error instanceof Error ? error.message : error);
  }
  return { status: "ok" };
}
